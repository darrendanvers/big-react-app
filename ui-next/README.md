# UI Next

The UI using React and Next.js.

## Configuring the local environment

1. Create a file called .env.local in the project root directory (this file will be ignored by Git).
2. You can copy the below text and place it in the file:

```
APP_SERVER_API_BASE_URI=http://localhost:5556
LOCAL_OIDC_WELL_KNOWN=http://localhost:3000/.well-known/openid-configuration
NEXTAUTH_URL=http://localhost:3001
APP_VERSION=1.0
```
3. If you wish to export telemetry data to an Open Telemetry collector, add the URL to the OTEL collector to the
   same file as the environment `APP_OTEL_COLLECTOR_URI` variable (local configuration of one forthcoming). You
   may also want to set the `NEXT_OTEL_VERBOSE=1` variable locally. This will forward all traces to the collector.
4. In addition, add values for `NEXTAUTH_SECRET`, `APP_LOCAL_OIDC_CLIENT_ID`, and `APP_LOCAL_OIDC_CLIENT_SECRET`. 
5. `APP_LOCAL_OIDC_CLIENT_ID` is the client ID you created for this application in the [oidc](../oidc) project.
   `APP_LOCAL_OIDC_CLIENT_SECRET` is the client secret you created for this application in the [oidc](../oidc) project. 
   `NEXTAUTH_SECRET` can  be any value.
6Run the command `npm run dev`.

## References

1. [https://nodejs.org/api/async_context.html#class-asynclocalstorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
2. [https://github.com/vercel/opentelemetry-collector-dev-setup](https://github.com/vercel/opentelemetry-collector-dev-setup)
3. [https://signoz.io/blog/opentelemetry-nextjs/](https://signoz.io/blog/opentelemetry-nextjs/)
4. [https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#prerequisites](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#prerequisites)
5. [https://next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)