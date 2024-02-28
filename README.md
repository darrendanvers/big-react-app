# Big React App

A playground for me to learn stuff about React. I don't even know what it'll do yet.

## Running with Docker Compose

The Docker Compose environment makes a few assumptions about how your setup looks. To get the OIDC server, backend,
and front-end up and running, take these steps:

1. Generate a JWKS signing key and cookie signing key (instructions on how 
   to do so are in the [README](./oidc/README.md)) of the OIDC project. Place those into a file
   in the [oidc](./oidc) directory named `.secret.env` with the variable names `JWKS_SIGNING_KEY` and
   `COOKIE_SIGNING_KEY` respectively.
2. Create a file named `clients.yml` and place it in the [oidc](./oidc) directory. A sample of this file
   is available below.
3. You will need to define an environment variable named `LOCALHOST` that is the name of your computer.
   This name needs to be routable from your browser but opaque to the services (you cannot use `localhost`). 
   Place this environment variable definition in a file named `.env` in this directory.
4. Generate a secret to encrypt cookies in the Next.js application (you can use the command `openssl rand -base64 32`
   to do so). Assign this secret to the environment variable `NEXTAUTH_SECRET` in the `.env` file.
5. Assign the client secret you defined in `clients.yml` to the environment variable `LOCAL_OIDC_CLIENT_SECRET`
   in the `.env` file. There is a sample below with all variables set.
6. In this directory, run the command `docker-compose build`.
7. Run the command `docker compose up`.
8. The services take 5-10 seconds to start up. Wait for logs from all three containers.
9. Open your browser and point it to [http://localhost:3001](http://localhost:3001).
10. You can log in with any user ID and password, there is no validation.
11. You can view your Open Telemetry data at [http://localhost:16686](http://localhost:16686) and [http://localhost:9090/](http://localhost:9090/).

### Sample clients.yml

```
- client_id: node_client
  client_secret: client-secret
  grant_types:
    - authorization_code
  response_types:
    - code
  redirect_uris:
    - http://localhost:3001/api/auth/callback/local
```

### Sample .env

```
LOCALHOST=the-name-of-my-computer.local
NEXTAUTH_SECRET=some-secret-for-cookies
LOCAL_OIDC_CLIENT_SECRET=client-secret
```