/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
	"api/src/logging"
	"api/src/otel"
	"api/src/routes"
	"errors"
	"github.com/rs/zerolog"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"golang.org/x/net/context"
	"net"
	"net/http"
	"os"
	"os/signal"
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

	logger := logging.ConfigureLogger("big-react-app-api", "dev")

	if err := run(logger); err != nil {
		logger.Fatal().Msgf("%s.", err)
	}
}

func run(logger zerolog.Logger) (err error) {

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Set up OpenTelemetry.
	otelShutdown, err := otel.ConfigureOtel(ctx)
	if err != nil {
		return
	}
	// Handle shutdown properly so nothing leaks.
	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	// Start the HTTP server.

	// The server and port the application is running on.
	serverAndPort := hostname + ":" + port
	fullURI := "http://" + serverAndPort

	server := http.Server{
		Addr:              serverAndPort,
		BaseContext:       func(_ net.Listener) context.Context { return ctx },
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      90 * time.Second,
		IdleTimeout:       120 * time.Second,
		Handler:           createHTTPHandler(logger),
	}
	serverError := make(chan error, 1)
	go func() {
		logger.Info().Msgf("Listening on %s.", fullURI)
		serverError <- server.ListenAndServe()
	}()

	select {
	case err = <-serverError:
		return
	case <-ctx.Done():
		stop()
	}

	err = server.Shutdown(context.Background())
	return
}

func createHTTPHandler(logger zerolog.Logger) http.Handler {

	mux := http.NewServeMux()

	unauthenticatedChainConfig := routes.MiddlewareChainConfig{Logger: logger}
	authenticatedChainConfig := routes.MiddlewareChainConfig{Authenticate: true, OidcProviderURI: oidcProviderURI, Audience: clientAudience, Logger: logger}

	// User info endpoint.
	routes.AddRouteToMuxOrFatal(mux, "/user", authenticatedChainConfig, routes.GetUserPermissions())
	routes.AddRouteToMuxOrFatal(mux, "/user/forbidden", authenticatedChainConfig, routes.ReturnForbidden())

	// Respond with data.
	routes.AddRouteToMuxOrFatal(mux, "/data", authenticatedChainConfig, routes.GetData())

	// Default route.
	routes.AddRouteToMuxOrFatal(mux, "/", unauthenticatedChainConfig, routes.PathUndefined())

	return otelhttp.NewHandler(mux, "/")
}
