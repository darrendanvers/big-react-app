# UI Next

The UI using React and Next.js.

## Configuring the local environment

1. Create a file called .env.local in the project root directory (this file will be ignored by Git). You can find
   a sample below.
2. If you wish to export telemetry data to an Open Telemetry collector, add the URL to the OTEL collector to the
   same file as the environment `APP_OTEL_COLLECTOR_URI` variable (local configuration of one forthcoming). You
   may also want to set the `NEXT_OTEL_VERBOSE=1` variable locally. This will forward all traces to the collector.
3. In addition, add values for `NEXTAUTH_SECRET`, `APP_LOCAL_OIDC_CLIENT_ID`, and `APP_LOCAL_OIDC_CLIENT_SECRET`. 
4. `APP_LOCAL_OIDC_CLIENT_ID` is the client ID you created for this application in the [oidc](../oidc) project.
   `APP_LOCAL_OIDC_CLIENT_SECRET` is the client secret you created for this application in the [oidc](../oidc) project. 
   `NEXTAUTH_SECRET` can  be any value.
5. Start the needed external services. The [dc.sh](../dc.sh) script allows you to do this easily.
6. Run the command `npm run dev`.

## Sample .evn.local file

```
APP_SERVER_API_BASE_URI=http://localhost:5556
LOCAL_OIDC_WELL_KNOWN=http://localhost:3000/.well-known/openid-configuration
NEXTAUTH_URL=http://localhost:3001
APP_VERSION=1.0
APP_AUTH_DB_USER=next-ui
APP_AUTH_DB_PASSWORD=next-ui-password
APP_AUTH_DB_HOST=localhost
APP_AUTH_DB_PORT=5432
APP_AUTH_DB_DB=next_ui
```

## References

1. [https://nodejs.org/api/async_context.html#class-asynclocalstorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
2. [https://github.com/vercel/opentelemetry-collector-dev-setup](https://github.com/vercel/opentelemetry-collector-dev-setup)
3. [https://signoz.io/blog/opentelemetry-nextjs/](https://signoz.io/blog/opentelemetry-nextjs/)
4. [https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#prerequisites](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#prerequisites)
5. [https://next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)