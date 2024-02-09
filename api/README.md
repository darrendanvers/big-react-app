# API

The backend application. It's pretty simple at this point is mostly there to handle interacting with the OIDC provider.
I'll expand it over time, but a complex backend is not the point of this application, so will stay thin.

I'm pretty new to Go, so don't judge the code here too harshly.

## Running the application

You will need to define the following environment variables to run this application.

- CLIENT_ID - The client ID for this application as configured in the OIDC provider.
- CLIENT_SECRET - The client secret for this application as configured in the OIDC provider.
- OIDC_PROVIDER_URI - The URI of the OIDC provider.
- HOSTNAME - The hostname of this application as configured in the OIDC provider.
- PORT - The port the application should be listening on.

The OIDC provider must already be running before starting this application.

## References

- [https://github.com/coreos/go-oidc/blob/v3.9.0/example/idtoken/app.go](https://github.com/coreos/go-oidc/blob/v3.9.0/example/idtoken/app.go)
- [https://pazel.dev/teach-me-pkce-proof-key-for-code-exchange-in-5-minutes](https://pazel.dev/teach-me-pkce-proof-key-for-code-exchange-in-5-minutes)
- [https://datatracker.ietf.org/doc/html/rfc7636#section-4.1](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)