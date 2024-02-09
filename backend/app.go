/*
This is an example application to demonstrate parsing an ID Token.
*/
package main

import (
    "backend/routes"
    "golang.org/x/net/context"
    "log"
    "net/http"
    "os"
)

var (
    clientID     = os.Getenv("CLIENT_ID")
    clientSecret = os.Getenv("CLIENT_SECRET")
)

// Main application driver method.
func main() {
    ctx := context.Background()

    // Initialize the login OIDC framework.
    loginHandler, err := routes.InitializeLogin(ctx, clientID, clientSecret)
    if err != nil {
        log.Fatal(err)
    }

    // Add routes for the login endpoints.
    http.HandleFunc("/", loginHandler.LoginRequest())
    http.HandleFunc("/auth/callback", loginHandler.AuthRequest(ctx))

    // Start the application.
    log.Printf("listening on http://%s/", "localhost:5556")
    log.Fatal(http.ListenAndServe("localhost:5556", nil))
}
