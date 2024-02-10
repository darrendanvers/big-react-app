import Provider from 'oidc-provider';
import fs from 'fs';
import { parse } from 'yaml'
import compile from 'es6-template-strings/compile.js'
import resolveToString from 'es6-template-strings/resolve-to-string.js'

// Look up account details.
async function findAccountImpl(ctx, id) {
    return {
        accountId: id,
        async claims(use, scope) {
            return {sub: id }
        }
    }
}


// Read the client configuration.
let clientConfigPath = "clients.yml";
if (process.env.CLIENTS_CONFIG) {
    clientConfigPath = process.env.CLIENTS_CONFIG;
}

console.log(`Loading clients from ${clientConfigPath}`);
const clientsFileContents = fs.readFileSync(clientConfigPath, 'utf8');

let resolvedFileContents = clientsFileContents;

// If the CLIENT_HOST environment variable is set, interpolate the contents of the file
// with that variable.
if (process.env.CLIENT_HOST) {
    const compiledFileContents = compile(clientsFileContents);
    resolvedFileContents = resolveToString(compiledFileContents, {clientHost: process.env.CLIENT_HOST});
}

const clientsConfig = parse(resolvedFileContents);

// The OIDC provider configuration.
const configuration = {
    jwks: {},
    cookies: {},
    clients: clientsConfig,
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

let issuer = 'http://localhost:3000';
if (process.env.ISSUER) {
    issuer = process.env.ISSUER;
}
console.log(`Using ${issuer} as issuer.`);

// Start the application.
const oidc = new Provider(issuer, configuration);
const server = oidc.listen(3000, () => {
    console.log(`oidc-provider listening on port 3000, check ${issuer}/.well-known/openid-configuration`);
});