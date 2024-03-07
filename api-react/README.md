> This repository is deprecated. Please see [../api](../api).
> 
# API

The backend application. I'll expand it over time, but a complex backend is not the point of this application, so will stay thin.

## Running the application

You will need to define the following environment variables to run this application.

- OIDC_PROVIDER_URI - The URI of the OIDC provider.
- OIDC_CLIENT_AUDIENCE - The audience the JWT passed from the client will have (the client_id in the client config in the [oidc](../oidc) project).
- OTEL_TRACE_ENDPOINT - The URI of the Open Telemetry trace endpoint.

- The OIDC provider must already be running before starting this application.

## References

- [https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)