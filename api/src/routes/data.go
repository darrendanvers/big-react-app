package routes

import (
	"api/src/logging"
	"api/src/otelconfig"
	"api/src/sanitization"
	"encoding/json"
	"github.com/rs/zerolog"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"net/http"
)

// Response is a simple structure to return to the client when it asks for data.
type Response struct {
	Property string `json:"property"`
}

var (
	dataTracer = otelconfig.NewTracer()
	dataMeter  = otelconfig.NewMeter("data")
	dataCount  metric.Int64Counter
)

func init() {

	var err error
	dataCount, err = dataMeter.Int64Counter("api_data",
		metric.WithDescription("The number of requests to the data endpoint by request value"),
		metric.WithUnit("{req}"))
	if err != nil {
		logger := logging.Logger()
		logger.Error().Msgf("Unable to create metric: %s.", err)
	}
}

// GetData returns a response to a client.
func GetData() http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Start tracking telemetry.
		ctx, span := dataTracer.Start(r.Context(), otelconfig.SpanName(r))
		defer span.End()

		logger := r.Context().Value(loggerKey).(zerolog.Logger)

		// Read in the user input.
		parameter := r.URL.Query().Get("parameter")
		sanitizedParameter := sanitization.Policy().Sanitize(parameter)
		logger.Info().Msgf("Returning data for '%s'.", sanitizedParameter)

		// Add the request to the telemetry data.
		dataValue := attribute.String("api.data.value", sanitizedParameter)
		span.SetAttributes(dataValue)
		// Keep track of how many times each value was requested.
		dataCount.Add(ctx, 1, metric.WithAttributes(dataValue))

		// Return the response.
		responseData := Response{Property: sanitizedParameter}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(responseData)
		if err != nil {
			logger.Error().Msgf("Error writing respsonse: %s.", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	})
}
