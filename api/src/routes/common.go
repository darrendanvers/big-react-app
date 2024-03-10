package routes

import "net/http"

type keyType int

const (
	oidcTokenKey keyType = iota
	loggerKey    keyType = iota
	spanIDKey            = "logging.googleapis.com/spanId"
)

// PathUndefined is the final, catch-all function when a URL does not
// match any of the defined routes. It will return a 401.
func PathUndefined() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	})
}
