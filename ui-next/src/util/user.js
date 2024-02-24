import {get} from "@/util/http";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {JwksClient} from "jwks-rsa";
import * as jwt from "jsonwebtoken";

/**
 * Returns a Promise that will resolve to the user's permissions.
 *
 * @returns {Promise<*>}
 */
export function getUserPermissions() {
   return get("/user/permissions");
}

/**
 * If present, returns a Promise that will resolve to the raw JWT of the logged-in user. If not present, will return null.
 *
 * @returns {Promise<GetServerSessionOptions["callbacks"] extends {session: (...args: any[]) => infer U} ? U : Session | null>}
 */
export function getRawUserToken() {

    return getServerSession(authOptions)
        .then((session) => {
            if (session == null) {
                return null;
            } else {
                return session.idToken;
            }
        });
}

/**
 * If present and valid, returns a Promise that will resolve to the logged-in users's JWT. If not present or the JWT
 * is no longer valid, will return null.
 * @returns {Promise<never>}
 */
export function getValidatedRawToken() {

    return getRawUserToken()
        .then((rawToken) => validateRawToken(rawToken));
}

function validateRawToken(token) {

    return validateRawTokenWithServer(token);
}

function validateRawTokenWithServer(token) {
    const provider = authOptions.providers[0];
    const wellKnown = provider.wellKnown;

    return fetch(wellKnown)
        .then((wellKnownResponse) => {
            if (!wellKnownResponse.ok) {
                console.log(wellKnownResponse.statusText);
                return Promise.reject(wellKnownResponse.statusText);
            }
            return wellKnownResponse.json()
                .then((wellKnownConfig) => {
                    console.log(wellKnownConfig.jwks_uri);
                    console.log(wellKnownConfig.jwks_uri);
                    return callValidation(wellKnownConfig.jwks_uri, token);
                });
        });
}

function callValidation(jwksUri, token) {

    if (token == null) {
        return Promise.resolve(null);
    }

    const jwksClient = new JwksClient({jwksUri: jwksUri});

    return new Promise((resolve, reject) => {
        jwt.verify(token, getSigningKeyRetriever(jwksClient),
            (err, key) => {
                if (err != null) {
                    return reject(err);
                }
                resolve(key);
            })
    })
}

function getSigningKeyRetriever(jwksCLient) {
   return (header, callback) => {
       jwksCLient.getSigningKey(header.kid,
           function(err, key) {
               if (err) {
                   return callback(err, null);
               }
               const signingKey = key.publicKey || key.rsaPublicKey;
               return callback(null, signingKey);
           }
       );
   };
}
