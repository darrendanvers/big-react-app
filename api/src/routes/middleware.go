package routes

import (
	"errors"
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/net/context"
	"io"
	"log"
	"net/http"
)

// MiddlewareChainConfig allows for configuration of the default middleware chain.
type MiddlewareChainConfig struct {
	Authenticate bool
	LoginHandler *LoginHandler
}

// MiddlewareChainOrFatal is a convenience method that will call MiddlewareChain and log a fatal error
// if it returns an error.
func MiddlewareChainOrFatal(config MiddlewareChainConfig, next http.Handler) http.Handler {

	handler, err := MiddlewareChain(config, next)
	if err != nil {
		log.Fatal(err)
	}
	return handler
}

// MiddlewareChain provides a standard set of HTTP handlers that are common across most
// functional handlers. It allows some configuration based on the MiddlewareChainConfig variable
// passed in. Currently, the only configuration is turning on or off the UserHandler to allow
// endpoints that do not need an authenticated user.
func MiddlewareChain(config MiddlewareChainConfig, next http.Handler) (http.Handler, error) {

	innerHandler := next
	if config.Authenticate {
		var err error
		innerHandler, err = UserHandler(config.LoginHandler, next)
		if err != nil {
			return nil, err
		}
	}
	return DrainAndCloseHandler(innerHandler), nil
}

// UserHandler provides an HTTP handler that validates the user has a valid JWT before proceeding. If
// the JWD is valid, it will call delegate for further processing. If not, it will set the
// HTTP response to 401 (if the token is not present or is expired) or 500 (if there is an error).
func UserHandler(loginHandler *LoginHandler, delegate http.Handler) (http.Handler, error) {

	if loginHandler == nil {
		return nil, errors.New("LoginHandler is required")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Pull the token from a cookie.
		rawIDToken, err := r.Cookie(oidcCookieKey)
		if err != nil {
			http.Error(w, "unauthenticated", http.StatusUnauthorized)
			return
		}

		// validate the token.
		oidcConfig := &oidc.Config{ClientID: loginHandler.config.ClientID}
		oidcToken, ok := loginHandler.validateToken(oidcConfig, w, r, rawIDToken.Value)
		if !ok {
			return
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, oidcTokenKey, oidcToken)
		r = r.WithContext(ctx)

		delegate.ServeHTTP(w, r)
	}), nil
}

// DrainAndCloseHandler provides an HTTP handler that will read any remaining bytes in the body of an
// HTTP request and then close the body.
func DrainAndCloseHandler(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		_, _ = io.Copy(io.Discard, r.Body)
		_ = r.Body.Close()
	})
}
