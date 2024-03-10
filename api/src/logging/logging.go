package logging

import (
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var (
	logger zerolog.Logger
)

// ConfigureLogger configures Zerolog. It will include the service and environment passed in as properties
// on all log messages.
func ConfigureLogger(service string, environment string) zerolog.Logger {

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	logger = log.With().
		Str("service", service).
		Str("env", environment).
		Logger()

	return Logger()
}

// Logger returns the currently configured Zerlog logger.
func Logger() zerolog.Logger {
	return logger
}
