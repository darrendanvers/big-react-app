import {get} from "@/util/http";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {JwksClient} from "jwks-rsa";
import * as jwt from "jsonwebtoken";
import {TokenExpiredError} from "jsonwebtoken";
import {logger} from "@/util/logging";

/**
 * Returns a Promise that will resolve to the user's permissions.
 *
 * @returns {Promise<*>}
 */
export function getUserPermissions() {
   return get("user");
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
        .then((rawToken) => validateRawToken(rawToken))
        .catch((err) => {
            logger.error(err.message);
            return Promise.resolve(null);
        });
}

function validateRawToken(token) {
    const provider = authOptions.providers[0];
    const wellKnown = provider.wellKnown;

    return fetch(wellKnown)
        .then((wellKnownResponse) => {
            if (!wellKnownResponse.ok) {
                return Promise.reject(wellKnownResponse.statusText);
            }
            return wellKnownResponse.json();
        }).then(wellKnownConfig => callValidation(wellKnownConfig.issuer, wellKnownConfig.jwks_uri, token))
        .catch((err) => {
            if (err instanceof TokenExpiredError) {
                return Promise.resolve(null);
            }
            return Promise.reject(err);
        });
}

function callValidation(issuer, jwksUri, token) {

    if (token == null) {
        return Promise.resolve(null);
    }

    const jwksClient = new JwksClient({jwksUri: jwksUri});

    return new Promise((resolve, reject) => {
        jwt.verify(token, getSigningKeyRetriever(jwksClient), {issuer: issuer, audience: process.env.APP_LOCAL_OIDC_CLIENT_ID},
            (err, key) => {
                if (err != null) {
                    reject(err);
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
