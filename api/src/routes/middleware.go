package routes

import (
	"errors"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/mrz1836/go-sanitize"
	"github.com/rs/zerolog"
	"golang.org/x/net/context"
	"io"
	"net/http"
	"strings"
)

// MiddlewareChainConfig allows for configuration of the default middleware chain.
type MiddlewareChainConfig struct {
	Authenticate    bool
	OidcProviderURI string
	Audience        string
	Logger          zerolog.Logger
}

// MiddlewareChainOrFatal is a convenience method that will call MiddlewareChain and log a fatal error
// if it returns an error.
func MiddlewareChainOrFatal(config MiddlewareChainConfig, next http.Handler) http.Handler {

	handler, err := MiddlewareChain(config, next)
	if err != nil {
		config.Logger.Fatal().Msg(err.Error())
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
		innerHandler, err = UserHandler(config, next)
		if err != nil {
			return nil, err
		}
	}
	return LogHandler(config, DrainAndCloseHandler(innerHandler)), nil
}

// LogHandler adds the logger from the MiddlewareChainConfig into the context so that it can
// be used by inner logs. It will also add a span ID to each request before sending the request
// further or in the chain.
func LogHandler(config MiddlewareChainConfig, next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		logger := config.Logger
		spanIDBytes, err := randBytes(8)
		if err == nil {
			spanID := bytesToHex(spanIDBytes)
			logger = config.Logger.With().Str(spanIDKey, spanID).Logger()
		}

		traceParent, err := getTraceID(r.Header.Get("traceparent"))
		if err != nil {
			logger.Error().Msgf("Unable to extrace trace ID: %s.", err)
		} else {
			logger.UpdateContext(func(c zerolog.Context) zerolog.Context { return c.Str("traceparent", traceParent) })
		}

		ctx := context.WithValue(r.Context(), loggerKey, logger)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func getTraceID(traceParent string) (string, error) {

	if traceParent == "" {
		return generateNewTraceID()
	}

	splitToken := strings.Split(traceParent, "-")
	if len(splitToken) < 2 {
		return generateNewTraceID()
	}
	return sanitize.AlphaNumeric(splitToken[1], false), nil
}

func generateNewTraceID() (string, error) {
	traceIDBytes, err := randBytes(16)
	if err == nil {
		return bytesToHex(traceIDBytes), nil
	}
	return "", err
}

// UserHandler provides an HTTP handler that validates the user has a valid JWT before proceeding. If
// the JWD is valid, it will call delegate for further processing. If not, it will set the
// HTTP response to 401 (if the token is not present or is expired) or 500 (if there is an error).
func UserHandler(config MiddlewareChainConfig, next http.Handler) (http.Handler, error) {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Pull the token from a cookie.
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "unauthenticated", http.StatusUnauthorized)
			return
		}
		splitToken := strings.Split(authHeader, "Bearer ")
		if len(splitToken) != 2 {
			http.Error(w, "unauthenticated", http.StatusUnauthorized)
			return
		}
		rawIDToken := splitToken[1]

		// validate the token.
		oidcConfig := &oidc.Config{ClientID: config.Audience}
		oidcToken, ok := validateToken(config.OidcProviderURI, oidcConfig, w, r, rawIDToken)
		if !ok {
			return
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, oidcTokenKey, oidcToken)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	}), nil
}

// validateToken checks that a JWD is valid. If not, it will set the HTTP response to 401
// (if the token is not present or is expired) or 500 (if there is an error).
func validateToken(oidcProviderURI string, oidcConfig *oidc.Config, w http.ResponseWriter, r *http.Request, rawToken string) (*oidc.IDToken, bool) {

	logger := r.Context().Value(loggerKey).(zerolog.Logger)

	provider, err := oidc.NewProvider(r.Context(), oidcProviderURI)
	if err != nil {
		logger.Error().Msgf("Unable to contact OIDC provider: %s.", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return nil, false
	}

	verifier := provider.Verifier(oidcConfig)
	idToken, err := verifier.Verify(r.Context(), rawToken)
	if err != nil {
		var tokenExpiredError *oidc.TokenExpiredError
		ok := errors.As(err, &tokenExpiredError)
		if ok {
			logger.Error().Msg("Expired token")
			http.Error(w, "token expired", http.StatusUnauthorized)
			return nil, false
		}
		logger.Error().Msgf("Unable to verify ID token: %s.", err)
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return nil, false
	}
	return idToken, true
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
