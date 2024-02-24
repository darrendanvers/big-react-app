# UI Next

The UI using React and Next.js.

## Configuring the local environment

1. Create a file called .env.local in the project root directory (this file will be ignored by Git).
2. You can copy the below text and place it in the file:

```
SERVER_API_BASE_URI=http://localhost:5556
LOCAL_OIDC_WELL_KNOWN=http://localhost:3000/.well-known/openid-configuration
NEXTAUTH_URL=http://localhost:3001
```

3. In addition, add values for `NEXTAUTH_SECRET` and `LOCAL_OIDC_CLIENT_SECRET`. `NEXTAUTH_SECRET` should be the
   client secret you created for this application in the [oidc](../oidc) project. `LOCAL_OIDC_CLIENT_SECRET` can
   be any value.
4. Run the command `npm run dev`.