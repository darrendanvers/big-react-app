import {get, HttpResponseWrapper} from "@/util/http";
import {getServerSession} from "next-auth/next";
import {authOptions, ExtendedSession} from "@/app/api/auth/[...nextauth]/route";
import {JwksClient, SigningKey} from "jwks-rsa";
import * as jwt from "jsonwebtoken";
import {
    GetPublicKeyOrSecret,
    JwtHeader,
    SigningKeyCallback,
    TokenExpiredError
} from "jsonwebtoken";
import {logger} from "@/util/logging";
import {OAuthConfig} from "next-auth/providers/oauth";

/**
 * The details of a user's permissions.
 */
export interface UserPermissionsResponse {
    permissions: string[]
}

/**
 * Returns a Promise that will resolve to the user's permissions.
 *
 * @returns {Promise<*>}
 */
export function getUserPermissions(): Promise<HttpResponseWrapper<UserPermissionsResponse>> {
   return get("user");
}

/**
 * If present, returns a Promise that will resolve to the raw JWT of the logged-in user. If not present, will return null.
 *
 * @returns {Promise<string|null>}
 */
export function getRawUserToken(): Promise<string|null> {

    return getServerSession(authOptions)
        .then((session) => {
            if (session == null) {
                return null;
            } else {
                const extendedSession: ExtendedSession = session as ExtendedSession
                if (!extendedSession.idToken) {
                    return null;
                }
                return extendedSession.idToken;
            }
        });
}

/**
 * If present and valid, returns a Promise that will resolve to the logged-in users's JWT. If not present or the JWT
 * is no longer valid, will return null.
 * @returns {Promise<string|null>}
 */
export function getValidatedRawToken():Promise<string|null> {

    return getRawUserToken()
        .then((rawToken) => validateRawToken(rawToken))
        .catch((err) => {
            logger.error(err.message);
            return Promise.resolve(null);
        });
}

function validateRawToken(token: string|null):Promise<string|null> {
    const provider = authOptions.providers[0] as OAuthConfig<any>;
    const wellKnown = provider.wellKnown || "";

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

function callValidation(issuer: string, jwksUri: string, token:string|null ): Promise<string|null> {

    if (token == null) {
        return Promise.resolve(null);
    }

    const jwksClient = new JwksClient({jwksUri: jwksUri});

    return new Promise((resolve, reject) => {
        jwt.verify(token, getSigningKeyRetriever(jwksClient), {issuer: issuer, audience: process.env.APP_LOCAL_OIDC_CLIENT_ID},
            (err, jwt) => {
                if (err != null) {
                    reject(err);
                }
                if (!jwt) {
                    reject(new Error('key is undefined'))
                }
                resolve(token);
            })
    })
}

function getSigningKeyRetriever(jwksCLient: JwksClient): GetPublicKeyOrSecret {
   return (header: JwtHeader, callback: SigningKeyCallback) => {
       jwksCLient.getSigningKey(header.kid,
           function(err: Error | null, key?: SigningKey) {
               if (err) {
                   return callback(err);
               }
               if (key == null) {
                   return callback(new Error('key undefined'))
               }
               // This may be a problem
               const signingKey = key.getPublicKey(); // || key.rsaPublicKey;
               return callback(null, signingKey);
           }
       );
   };
}
