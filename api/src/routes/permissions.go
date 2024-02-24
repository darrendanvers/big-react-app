package routes

import (
	"encoding/json"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/rs/zerolog"
	"net/http"
)

// UserPermissions contains an array of permissions for a specific user.
type UserPermissions struct {
	UserID      string   `json:"userId"`
	Permissions []string `json:"permissions"`
}

// ReturnForbidden creates an HTTP Handler that will return a 403 for testing a user hitting
// an endpoint they do not have access to.
func ReturnForbidden() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "forbidden", http.StatusForbidden)
	})
}

// GetUserPermissions creates an HTTP Handler that will return a user's permissions.
func GetUserPermissions() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		logger := r.Context().Value(loggerKey).(zerolog.Logger)

		ctx := r.Context()
		token, ok := ctx.Value(oidcTokenKey).(*oidc.IDToken)
		if !ok {
			logger.Error().Msg("Call to get user permissions no logged in user.")
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// Just something for now.
		var perms []string
		if token.Subject == "ddddd" {
			perms = []string{"view", "edit", "admin"}
		} else {
			perms = []string{"view"}
		}

		permissions := UserPermissions{UserID: token.Subject, Permissions: perms}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(permissions)
		if err != nil {
			logger.Error().Msgf("Error wriring respsonse: %s.", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	})
}
