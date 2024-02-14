package routes

import (
	"context"
	"errors"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/rs/zerolog"
	"golang.org/x/oauth2"
	"net/http"
)

// LoginHandler provides configuration for the login framework.
type LoginHandler struct {
	logger   zerolog.Logger
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

		logger := r.Context().Value(loggerKey).(zerolog.Logger)
		// Generate a random string we can send to the ODIC provider and get back to tie the response back
		// to the original request.
		state, err := randString(32)
		if err != nil {
			logger.Error().Msgf("Unable to generate state string: %s.", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
		}

		// Generate the PKCE code and challenge.
		newChallengePair, err := generateCodePair()
		if err != nil {
			logger.Error().Msgf("Unable to generate challenge pair: %s.", err)
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

		logger := r.Context().Value(loggerKey).(zerolog.Logger)

		oidcConfig := &oidc.Config{ClientID: loginHandler.config.ClientID}

		code := r.URL.Query().Get("code")
		state := r.URL.Query().Get("state")
		initialChallenge := loginHandler.tokenMap[state]
		delete(loginHandler.tokenMap, state)

		// Get the detailed token information from the OIDC provider.
		oauth2Token, err := loginHandler.config.Exchange(r.Context(), code, oauth2.SetAuthURLParam("code_verifier", initialChallenge))
		if err != nil {
			logger.Error().Msgf("Unable to verify token: %s.", err)
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// Pull out the raw token from the response.
		rawIDToken, ok := oauth2Token.Extra("id_token").(string)
		if !ok {
			logger.Error().Msg("No ID token in Oauth token")
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		// validate the token.
		idToken, ok := loginHandler.validateToken(oidcConfig, w, r, rawIDToken)
		if !ok {
			return
		}

		// Add a cookie with the token to the response.
		setCookie(w, r, oidcCookieKey, rawIDToken)

		writeTokenToResponse(logger, idToken, w)
	})
}

// validateToken checks that a JWD is valid. If not, it will set the HTTP response to 401
// (if the token is not present or is expired) or 500 (if there is an error).
func (loginHandler *LoginHandler) validateToken(oidcConfig *oidc.Config, w http.ResponseWriter, r *http.Request, rawToken string) (*oidc.IDToken, bool) {

	logger := r.Context().Value(loggerKey).(zerolog.Logger)

	verifier := loginHandler.provider.Verifier(oidcConfig)
	idToken, err := verifier.Verify(r.Context(), rawToken)
	if err != nil {
		var tokenExpiredError *oidc.TokenExpiredError
		ok := errors.As(err, &tokenExpiredError)
		if ok {
			logger.Error().Msg("Expired token")
			http.Error(w, "unauthenticated", http.StatusUnauthorized)
			return nil, false
		}
		logger.Error().Msgf("Unable to verify ID token: %s.", err)
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
