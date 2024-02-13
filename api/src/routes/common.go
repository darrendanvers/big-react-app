package routes

import (
    "encoding/json"
    "github.com/coreos/go-oidc/v3/oidc"
    "log"
    "net/http"
    "time"
)

type keyType int

const (
    oidcCookieKey         = "token"
    oidcTokenKey  keyType = iota
)

// setCookie is a convenience method to add a cooke to an HTTP response with
// a timeout of 1 day. The path of the cookie is root, and it is set to HTTP only.
func setCookie(w http.ResponseWriter, r *http.Request, name, value string) {
    c := &http.Cookie{
        Name:     name,
        Value:    value,
        MaxAge:   int(time.Hour.Seconds() * 24),
        Secure:   r.TLS != nil,
        HttpOnly: true,
        Path:     "/",
    }
    http.SetCookie(w, c)
}

// writeTokenToResponse writes the claims portion of the passed in IDToken
// to the HTTP response in JSON format.
func writeTokenToResponse(idToken *oidc.IDToken, w http.ResponseWriter) {

    idTokenClaims := new(json.RawMessage)
    if err := idToken.Claims(&idTokenClaims); err != nil {
        log.Printf("Unable to extract claims: %s.", err)
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }
    data, err := json.MarshalIndent(idTokenClaims, "", "    ")
    if err != nil {
        log.Printf("Unable to format token: %s.", err)
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }

    bytesWritten, err := w.Write(data)
    if err != nil {
        log.Printf("Error writing output: %s.", err)
        return
    }
    log.Printf("%d bytes written.", bytesWritten)
}
