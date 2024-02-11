package routes

import (
    "github.com/coreos/go-oidc/v3/oidc"
    "log"
    "net/http"
)

// UserInfo returns the claims from the JWT of the logged-in user. This method
// assumes the JWT has been added to the HTTP Request's context with the key
// defined in the OIDCTokenKey variable.
func UserInfo(w http.ResponseWriter, r *http.Request) {

    ctx := r.Context()
    token, ok := ctx.Value(oidcTokenKey).(*oidc.IDToken)
    if !ok {
        log.Printf("Call to user info with no logged in user.")
        http.Error(w, "unauthorized", http.StatusUnauthorized)
        return
    }

    writeTokenToResponse(token, w)
}

// PathUndefined is the final, catch-all function when a URL does not
// match any of the defined routes. It will return a 401.
func PathUndefined(w http.ResponseWriter, _ *http.Request) {

    http.Error(w, "unauthorized", http.StatusUnauthorized)
}
