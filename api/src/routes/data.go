package routes

import (
	"api/src/sanitization"
	"encoding/json"
	"github.com/rs/zerolog"
	"net/http"
)

// Response is a simple structure to return to the client when it asks for data.
type Response struct {
	Property string `json:"property"`
}

// GetData returns a response to a client.
func GetData() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		logger := r.Context().Value(loggerKey).(zerolog.Logger)

		parameter := r.URL.Query().Get("parameter")
		sanitizedParameter := sanitization.Policy().Sanitize(parameter)

		logger.Info().Msgf("Returning data for '%s'.", sanitizedParameter)

		responseData := Response{Property: sanitizedParameter}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(responseData)
		if err != nil {
			logger.Error().Msgf("Error wriring respsonse: %s.", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	})
}
