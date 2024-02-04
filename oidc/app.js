import Provider, {errors} from 'oidc-provider';


const configuration = {jwks: {}, cookies: {}};

// If there is a JWKS signing key defined in the environment, use that.
if (process.env.JWKS_SIGNING_KEY) {
    console.log('Using custom JWKS signing key.')
    const jwksAsJson = Buffer.from(process.env.JWKS_SIGNING_KEY, 'base64').toString('utf8');
    const jwksKeys = JSON.parse(jwksAsJson);
    configuration.jwks.keys = jwksKeys.keys;
}

// If there is a cookie signing key defined, use that.
if (process.env.COOKIE_SIGNING_KEY) {
    console.log('Using custom cookie signing key.');
    configuration.cookies.keys = [process.env.COOKIE_SIGNING_KEY];
}


// Start the application.
const oidc = new Provider('http://localhost:3000', configuration);
const server = oidc.listen(3000, () => {
    console.log('oidc-provider listening on port 3000, check http://localhost:3000/.well-known/openid-configuration');
});