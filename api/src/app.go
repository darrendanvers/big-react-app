/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
    "api/src/routes"
    "golang.org/x/net/context"
    "log"
    "net/http"
    "os"
    "time"
)

var (
    clientID        = os.Getenv("CLIENT_ID")         // The client ID for this application as configured in the OIDC provider.
    clientSecret    = os.Getenv("CLIENT_SECRET")     // The client secret for this application as configured in the OIDC provider.
    oidcProviderURI = os.Getenv("OIDC_PROVIDER_URI") // The URI of the OIDC provider.
    hostname        = os.Getenv("HOSTNAME")          // The hostname of this application as configured in the OIDC provider.
    port            = os.Getenv("PORT")              // The port the application should be listening on.
    redirectBaseURI = os.Getenv("REDIRECT_URI")      // The URL to send to the OIDC provider to redirect the browser back to.
)

// Main application driver method.
func main() {
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

    // Initialize the login OIDC framework.
    loginHandler, err := routes.InitializeLogin(ctx, oidcProviderURI,
        redirectURI, clientID, clientSecret)
    if err != nil {
        log.Fatal(err)
    }

    mux := http.NewServeMux()

    // Add routes for the login endpoints.
    mux.Handle("/login", loginHandler.LoginRequest())
    mux.Handle("/auth/callback", loginHandler.AuthRequest())

    // User info endpoint.
    mux.Handle("/user", loginHandler.UserFilterFunc(routes.UserInfo))

    // Default route.
    mux.HandleFunc("/", routes.PathUndefined)

    // Start the application.
    server := http.Server{
        Addr:         serverAndPort,
        ReadTimeout:  30 * time.Second,
        WriteTimeout: 90 * time.Second,
        IdleTimeout:  120 * time.Second,
        Handler:      mux,
    }
    log.Printf("listening on %s.", fullURI)
    log.Fatal(server.ListenAndServe())
}
