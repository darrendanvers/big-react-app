import Provider, {errors} from 'oidc-provider';

// Look up account details.
async function findAccountImpl(ctx, id) {
    return {
        accountId: id,
        async claims(use, scope) {
            return {sub: id }
        }
    }
}

const configuration = {
    jwks: {},
    cookies: {},
    clients: [
        // The test application.
        {
            client_id: 'oidc_client',
            client_secret: process.env.CLIENT_SECRET,
            grant_types: ['authorization_code'],
            response_types: ['code'],
            redirect_uris: ['http://localhost:5556/auth/callback']
        }],
    features: {
        // Needed to get the details of the opaque token.
        introspection: {
            enabled: true
        },
    },
    // This is the defaults. Leaving it here in case I want to play with them,
    // so I don't have to find it in the future.
    claims: {
        acr: null,
        auth_time: null,
        iss: null,
        openid: [
            'sub'
        ],
        sid: null
    },
    findAccount: findAccountImpl
};

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