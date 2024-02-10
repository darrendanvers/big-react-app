# OIDC

A lightly configured OIDC provider to aid in testing out authentication and authorization in the React app.

## Configuring client applications

1. Create a YAML file with each client's configuration. By default, this file expected to be named `clients.yml`
2. If you want to use another name, pass the path to this file to the application with the environment variable `CLIENTS_CONFIG`.

Below is an example file:

```
- client_id: oidc_client
  client_secret: client_secret
  grant_types:
    - authorization_code
  response_types:
    - code
  redirect_uris:
    - http://api:5556/auth/callback
```

The structure of the client object is defined in 
the [Node OIDC Provider documentation](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#clients).

## Running the application with a JWT key

If you do not have a key, you can generate one with these steps. If you have your own already,
skip to step 4.

1. Go to [https://mkjwk.org](https://mkjwk.org).
2. Set the following parameters and click *Generate*:
   - Key Size: 2048
   - Key Use: Signature
   - Algorithm: RSASSA-PKCS1-v1_5 using SHA-256
   - Key ID: SHA-256
3. Copy the box with the public and private keypair set to the clipboard.
4. Base64 encode this value and assign it to the `JWKS_SIGNING_KEY` environment variable.
5. For convenience, you can assign this environment variable in a file called `.secret.env`. Git
   will ignore this file.
6. If you add this environment variable to the file as described above, you can start the application
   with the command `npm run with-key`.

## Running the app with a cookie signing key

1. Generate a random string.
2. Use that value to set the `COOKIE_SIGNING_KEY` environment variable.
3. For convenience, you can assign this environment variable in a file called `.secret.env`. Git
   will ignore this file.

## Manually testing authentication.

1. Start the OIDC application by running `npm run [with-key|start]`.
2. Run the command `npm run manual_test`. This will generate a verification code, write it to the [.last_verifier.env](./.last_verifier.env) file, and launch the browser.
3. Log in using the presented page. There is no user store, so you can use anything as the user ID and password.
4. The browser will navigate to a page that does not exist, but you'll get the login code in the URL. Copy that code.
5. Execute `./check_token.sh <the code you got from the browser>`. This will fetch the user info and format it (assuming you have Python installed on your machine).


## References

- [https://www.scottbrady91.com/openid-connect/getting-started-with-oidc-provider](https://www.scottbrady91.com/openid-connect/getting-started-with-oidc-provider)
- [https://developer.okta.com/blog/2017/07/25/oidc-primer-part-1](https://developer.okta.com/blog/2017/07/25/oidc-primer-part-1)
- [https://github.com/panva/node-oidc-provider/blob/main/docs/README.md](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md)
