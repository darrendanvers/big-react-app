[https://www.scottbrady91.com/openid-connect/getting-started-with-oidc-provider](https://www.scottbrady91.com/openid-connect/getting-started-with-oidc-provider)

## Running the application with a JWT key

If you do not have a key, you can generate one with these steps. If you have your own alredy,
skip to step 4.

1. Go to [https://mkjwk.org](https://mkjwk.org).
2. Set the following parameters and click *Generate*:
   - Key Size: 2048
   - Key Use: Signature
   - Algorithm: RSASSA-PKCS1-v1_5 using SHA-256
   - Key ID: SHA-256
3. Copy the box with the public and private keypair set to the clipboard.
4. Base64 encode this value and set it to the `JWKS_SIGNING_KEY` environment variable.
5. For convenience, you can assign this environment variable in a file called `.secret.env`. Git
   will ignore this file.
6. If you add this environment variable to the file as described above, you can start the application
   with the command `npm run with-key`.

## Running the app with a cookie signing key

1. Generate a random string.
2. Use that value to set the `COOKIE_SIGNING_KEY` environment variable.
3. For convenience, you can assign this environment variable in a file called `.secret.env`. Git
   will ignore this file.