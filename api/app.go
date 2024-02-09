/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
    "api/routes"
    "golang.org/x/net/context"
    "log"
    "net/http"
    "os"
)

var (
    clientID        = os.Getenv("CLIENT_ID")         // The client ID for this application as configured in the OIDC provider.
    clientSecret    = os.Getenv("CLIENT_SECRET")     // The client secret for this application as configured in the OIDC provider.
    oidcProviderUri = os.Getenv("OIDC_PROVIDER_URI") // The URI of the OIDC provider.
    hostname        = os.Getenv("HOSTNAME")          // The hostname of this application as configured in the OIDC provider.
    port            = os.Getenv("PORT")              // The port the application should be listening on.
)

// Main application driver method.
func main() {
    ctx := context.Background()

    serverAndPort := hostname + ":" + port
    fullUri := "http://" + serverAndPort

    // Initialize the login OIDC framework.
    loginHandler, err := routes.InitializeLogin(ctx, oidcProviderUri,
        fullUri+"/auth/callback", clientID, clientSecret)
    if err != nil {
        log.Fatal(err)
    }

    // Add routes for the login endpoints.
    http.HandleFunc("/", loginHandler.LoginRequest())
    http.HandleFunc("/auth/callback", loginHandler.AuthRequest(ctx))

    // Start the application.
    log.Printf("listening on %s.", fullUri)
    log.Fatal(http.ListenAndServe(serverAndPort, nil))
}
