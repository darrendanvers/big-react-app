package routes

import (
    "context"
    "crypto/rand"
    "crypto/sha256"
    "encoding/base64"

    "errors"
    "github.com/coreos/go-oidc/v3/oidc"
    "golang.org/x/oauth2"
    "io"
    "log"
    "net/http"
)

// LoginHandler provides configuration for the login framework.
type LoginHandler struct {
    provider *oidc.Provider
    config   oauth2.Config
    tokenMap map[string]string
}

type challengePair struct {
    code          string
    codeChallenge string
}

// InitializeLogin initializes the login framework.
func InitializeLogin(ctx context.Context, oidcProviderURI string, callbackRoute string, clientID string, clientSecret string) (*LoginHandler, error) {

    provider, err := oidc.NewProvider(ctx, oidcProviderURI)
    if err != nil {
        return nil, err
    }

    config := oauth2.Config{
        ClientID:     clientID,
        ClientSecret: clientSecret,
        Endpoint:     provider.Endpoint(),
        RedirectURL:  callbackRoute,
        Scopes:       []string{oidc.ScopeOpenID},
    }

    tokenMap := make(map[string]string)

    handler := &LoginHandler{
        provider: provider,
        config:   config,
        tokenMap: tokenMap,
    }
    return handler, nil
}

// LoginRequest generates a callback for an HTTP request. The callback will redirect the
// user to the OIDC provider.
func (loginHandler *LoginHandler) LoginRequest() http.Handler {

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

        // Generate a random string we can send to the ODIC provider and get back to tie the response back
        // to the original request.
        state, err := randString(32)
        if err != nil {
            log.Printf("Unable to generate state string: %s.", err)
            http.Error(w, "Internal error", http.StatusInternalServerError)
        }

        // Generate the PKCE code and challenge.
        newChallengePair, err := generateCodePair()
        if err != nil {
            log.Printf("Unable to generate challenge pair: %s.", err)
            http.Error(w, "Internal error", http.StatusInternalServerError)
            return
        }
        loginHandler.tokenMap[state] = newChallengePair.code

        // Redirect to the OIDC provider.
        authURL := loginHandler.config.AuthCodeURL(state,
            oauth2.SetAuthURLParam("code_challenge", newChallengePair.codeChallenge),
            oauth2.SetAuthURLParam("code_challenge_method", "S256"),
            oauth2.SetAuthURLParam("response_mode", "query"))
        http.Redirect(w, r, authURL, http.StatusFound)
    })
}

// AuthRequest generates a callback for the HTTP request the OIDC provider will redirect the browser to
// after the user has logged in.
func (loginHandler *LoginHandler) AuthRequest() http.Handler {

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

        oidcConfig := &oidc.Config{ClientID: loginHandler.config.ClientID}

        code := r.URL.Query().Get("code")
        state := r.URL.Query().Get("state")
        initialChallenge := loginHandler.tokenMap[state]
        delete(loginHandler.tokenMap, state)

        // Get the detailed token information from the OIDC provider.
        oauth2Token, err := loginHandler.config.Exchange(r.Context(), code, oauth2.SetAuthURLParam("code_verifier", initialChallenge))
        if err != nil {
            log.Printf("Unable to verify token: %s.", err)
            http.Error(w, "Internal error", http.StatusInternalServerError)
            return
        }

        // Pull out the raw token from the response.
        rawIDToken, ok := oauth2Token.Extra("id_token").(string)
        if !ok {
            log.Printf("No ID token in Oauth token")
            http.Error(w, "Internal error", http.StatusInternalServerError)
            return
        }

        // validate the token.
        idToken, ok := loginHandler.validateToken(oidcConfig, w, r, rawIDToken)
        if !ok {
            return
        }

        // Add a cookie with the token to the response.
        setCookie(w, r, "token", rawIDToken)

        writeTokenToResponse(idToken, w)
    })
}

// UserFilter provides an HTTP handler that validates the user has a valid JWT before proceeding. If
// the JWD is valid, it will call delegate for further processing. If not, it will set the
// HTTP response to 401 (if the token is not present or is expired) or 500 (if there is an error).
func (loginHandler *LoginHandler) UserFilter(delegate http.Handler) http.Handler {

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

        rawIDToken, err := r.Cookie("token")
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
    })
}

// UserFilterFunc is a convenience method that has the same semantics as UserFilter, but will take
// a function rather than a http.Handler as a parameter.
func (loginHandler *LoginHandler) UserFilterFunc(delegate func(w http.ResponseWriter, r *http.Request)) http.Handler {
    return loginHandler.UserFilter(http.HandlerFunc(delegate))
}

// validateToken checks that a JWD is valid. If not, it will set the HTTP response to 401
// (if the token is not present or is expired) or 500 (if there is an error).
func (loginHandler *LoginHandler) validateToken(oidcConfig *oidc.Config, w http.ResponseWriter, r *http.Request, rawToken string) (*oidc.IDToken, bool) {

    verifier := loginHandler.provider.Verifier(oidcConfig)
    idToken, err := verifier.Verify(r.Context(), rawToken)
    if err != nil {
        var tokenExpiredError *oidc.TokenExpiredError
        ok := errors.As(err, &tokenExpiredError)
        if ok {
            log.Printf("Expired token")
            http.Error(w, "unauthenticated", http.StatusUnauthorized)
            return nil, false
        }
        log.Printf("Unable to verify ID token: %s.", err)
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return nil, false
    }
    return idToken, true
}

// generateCodePair will produce a base64 URL encode string from 32 randomly chosen bytes (code).
// In addition to that string, it will return a base64 URL encoded string of the SHA256 hash
// of the original string (codeChallenge). These are suitable for use in the PKCE portion of the
// call to the OIDC provider.
func generateCodePair() (challengePair, error) {

    // The initial string
    code, err := randString(32)
    if err != nil {
        return challengePair{}, err
    }

    // Generate a SHA25 hash of the initial string, and base 64 URL encode the hash.
    hashedCode := hashString(code)
    encodedHash := bytesToString(hashedCode)

    return challengePair{
        code:          code,
        codeChallenge: encodedHash,
    }, nil
}

// randBytes generates a random series of nByt bytes.
func randBytes(nByte int) ([]byte, error) {
    b := make([]byte, nByte)
    _, err := io.ReadFull(rand.Reader, b)
    return b, err
}

// hashString returns the SHA256 has of a string.
func hashString(s string) []byte {
    h := sha256.New()
    h.Write([]byte(s))
    return h.Sum(nil)
}

// bytesToString returns a base64 URL encoding of a series of bytes.
func bytesToString(b []byte) string {
    return base64.RawURLEncoding.EncodeToString(b)
}

// randString returns a string that is a base64 encoding of a series of nByte random bytes.
func randString(nByte int) (string, error) {
    b, err := randBytes(nByte)
    if err != nil {
        return "", err
    }
    return base64.RawURLEncoding.EncodeToString(b), nil
}
