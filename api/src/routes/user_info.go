package routes

import (
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/rs/zerolog"
	"net/http"
)

// UserInfo returns the claims from the JWT of the logged-in user. This method
// assumes the JWT has been added to the HTTP Request's context with the key
// defined in the OIDCTokenKey variable.
func UserInfo() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		logger := r.Context().Value(loggerKey).(zerolog.Logger)

		ctx := r.Context()
		token, ok := ctx.Value(oidcTokenKey).(*oidc.IDToken)
		if !ok {
			logger.Error().Msg("Call to user info with no logged in user.")
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		writeTokenToResponse(logger, token, w)
	})
}

// PathUndefined is the final, catch-all function when a URL does not
// match any of the defined routes. It will return a 401.
func PathUndefined() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	})
}
