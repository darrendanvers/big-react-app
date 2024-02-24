/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
	"api/src/routes"
	"errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"net/http"
	"os"
	"time"
)

var (
	oidcProviderURI = os.Getenv("OIDC_PROVIDER_URI") // The URI of the OIDC provider.
	hostname        = os.Getenv("HOSTNAME")          // The hostname of this application as configured in the OIDC provider.
	port            = os.Getenv("PORT")              // The port the application should be listening on.
	clientAudience  = os.Getenv("CLIENT_AUDIENCE")   // The audience that JWTs from the client application will contain.
)

// Main application driver method.
func main() {

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	logger := log.With().
		Str("service", "big-react-app-api").
		Str("env", "dev").
		Logger()

	mux := http.NewServeMux()

	unauthenticatedChainConfig := routes.MiddlewareChainConfig{Logger: logger}
	authenticatedChainConfig := routes.MiddlewareChainConfig{Authenticate: true, OidcProviderURI: oidcProviderURI, Audience: clientAudience, Logger: logger}

	// User info endpoint.
	mux.Handle("/user/permissions", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.GetUserPermissions()))
	mux.Handle("/user/forbidden", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.ReturnForbidden()))

	// Respond with data.
	mux.Handle("/data", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.GetData()))

	// Default route.
	mux.Handle("/", routes.MiddlewareChainOrFatal(unauthenticatedChainConfig, routes.PathUndefined()))

	// Start the application.
	// The server and port the application is running on.
	serverAndPort := hostname + ":" + port
	fullURI := "http://" + serverAndPort

	server := http.Server{
		Addr:              serverAndPort,
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      90 * time.Second,
		IdleTimeout:       120 * time.Second,
		Handler:           mux,
	}
	logger.Info().Msgf("Listening on %s.", fullURI)
	err := server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		logger.Fatal().Msg(err.Error())
	}
}
