package routes

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"io"
	"net/http"
	"time"
)

type keyType int

const (
	oidcCookieKey         = "token"
	oidcTokenKey  keyType = iota
	loggerKey     keyType = iota
	spanIDKey             = "logging.googleapis.com/spanId"
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
func writeTokenToResponse(logger zerolog.Logger, idToken *oidc.IDToken, w http.ResponseWriter) {

	idTokenClaims := new(json.RawMessage)
	if err := idToken.Claims(&idTokenClaims); err != nil {
		logger.Error().Msgf("Unable to extract claims: %s.", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	data, err := json.MarshalIndent(idTokenClaims, "", "    ")
	if err != nil {
		logger.Error().Msgf("Unable to format token: %s.", err)
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	bytesWritten, err := w.Write(data)
	if err != nil {
		log.Printf("Error writing output: %s.", err)
		return
	}
	logger.Info().Msgf("%d bytes written.", bytesWritten)
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

func bytesToHex(b []byte) string {
	return hex.EncodeToString(b)
}

// randString returns a string that is a base64 encoding of a series of nByte random bytes.
func randString(nByte int) (string, error) {
	b, err := randBytes(nByte)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
