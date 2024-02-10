# Big React App

A playground for me to learn stuff about React. I don't even know what it'll do yet.

## Running with Docker Compose

The Docker Compose environment makes a few assumptions about how your setup looks. To get the OIDC server 
and backend up and running, take these steps:

1. Generate a JWKS signing key and cookie signing key (instructions on how 
   to do so are in the [README](./oidc/README.md)) of the OIDC project. Place those into a file
   in the [oidc](./oidc) directory named `.secret.env` with the variable names `JWKS_SIGNING_KEY` and
   `COOKIE_SIGNING_KEY` respectively.
2. Create a file named `clients.yml` and place it in the [oidc](./oidc) directory. A sample of this file
   is available below.
3. Create a file named `.secret.env` in the [api](./api) directory. It should contain the same secret
   you defined in the `clients.yml` file with variable name `CLIENT_SECRET`.
4. In this directory, run the command `docker-compose build`.
5. You will need to define an environment variable named `LOCALHOST` that is the name of your computer.
   This name needs to be routable from your browser but opaque to the services (you cannot use `localhost`). 
   Place this variable definition in a file named `.env` in this directory.
6. Run the command `docker compose up`.
7. The services take 5-10 seconds to start up.
8. Open your browser and point it to [http://localhost:5556](http://localhost:5556).

### Sample clients.yml

```
- client_id: oidc_client
  client_secret: <generate a client secret>
  grant_types:
    - authorization_code
  response_types:
    - code
  redirect_uris:
    - http://localhost:5556/auth/callback
    - http://${clientHost}:5556/auth/callback
```
