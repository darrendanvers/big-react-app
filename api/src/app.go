/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
	"api/src/routes"
	"errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"golang.org/x/net/context"
	"net/http"
	"os"
	"time"
)

var (
	clientID         = os.Getenv("CLIENT_ID")              // The client ID for this application as configured in the OIDC provider.
	clientSecret     = os.Getenv("CLIENT_SECRET")          // The client secret for this application as configured in the OIDC provider.
	oidcProviderURI  = os.Getenv("OIDC_PROVIDER_URI")      // The URI of the OIDC provider.
	hostname         = os.Getenv("HOSTNAME")               // The hostname of this application as configured in the OIDC provider.
	port             = os.Getenv("PORT")                   // The port the application should be listening on.
	redirectBaseURI  = os.Getenv("REDIRECT_URI")           // The URL to send to the OIDC provider to redirect the browser back to.
	allowedRedirects = os.Getenv("ALLOWED_REDIRECT_REGEX") // A regex to validate URIs this server is allowed to redirect back to after successful login.
)

// Main application driver method.
func main() {

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	logger := log.With().
		Str("service", "big-react-app-api").
		Str("env", "dev").
		Logger()

	ctx := context.Background()

	// The server and port the application is running on.
	serverAndPort := hostname + ":" + port
	fullURI := "http://" + serverAndPort

	// In a Docker Compose environment, the redirect
	// may not match the server name, so reconcile that.
	redirectURI := fullURI + "/auth/callback"
	if redirectBaseURI != "" {
		redirectURI = redirectBaseURI + "/auth/callback"
	}

	//redirectURI := "http://localhost:3001/api/auth/callback"

	// Initialize the login OIDC framework.
	loginConfig := routes.LoginConfig{
		OidcProviderURI:       oidcProviderURI,
		CallbackRoute:         redirectURI,
		ClientID:              clientID,
		ClientSecret:          clientSecret,
		AllowedRedirectsRegex: allowedRedirects,
	}
	loginHandler, err := routes.InitializeLogin(ctx, loginConfig)
	if err != nil {
		logger.Fatal().Msg(err.Error())
	}

	mux := http.NewServeMux()

	unauthenticatedChainConfig := routes.MiddlewareChainConfig{Logger: logger}
	authenticatedChainConfig := routes.MiddlewareChainConfig{Authenticate: true, LoginHandler: loginHandler, Logger: logger}

	// Add routes for the login endpoints.
	mux.Handle("/login", routes.MiddlewareChainOrFatal(unauthenticatedChainConfig, loginHandler.LoginRequest()))
	mux.Handle("/auth/callback", routes.MiddlewareChainOrFatal(unauthenticatedChainConfig, loginHandler.AuthRequest()))

	// User info endpoint.
	mux.Handle("/user", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.UserInfo()))
	mux.Handle("/user/permissions", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.GetUserPermissions()))
	mux.Handle("/user/forbidden", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.ReturnForbidden()))

	// Respond with data.
	mux.Handle("/data", routes.MiddlewareChainOrFatal(authenticatedChainConfig, routes.GetData()))

	// Default route.
	mux.Handle("/", routes.MiddlewareChainOrFatal(unauthenticatedChainConfig, routes.PathUndefined()))

	// Start the application.
	server := http.Server{
		Addr:              serverAndPort,
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      90 * time.Second,
		IdleTimeout:       120 * time.Second,
		Handler:           mux,
	}
	logger.Info().Msgf("Listening on %s.", fullURI)
	err = server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		logger.Fatal().Msg(err.Error())
	}
}
