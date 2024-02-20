import {cookies} from "next/headers";
import {decorateRequestWithUserToken, getServerApiBaseUri, getOpts} from "@/util/http";

/**
 * Returns the raw user login token after validation wrapped in an indicator object. If the token is valid,
 * the wrapper object contains an ok property with a value of true. If the token is not present or is invalid, the
 * wrapper object contains an ok property with a value of false.
 * @returns {Promise<{ok: boolean, token: null|string} | {ok: boolean}>|Promise<Awaited<{ok: boolean}>>}
 */
export function getValidatedRawToken() {

    const token = getRawUserToken();
    if  (token == null) {
        return Promise.resolve({ok: false});
    } else {
        return validateUserToken(token)
            .then((j) => {
                if (j.ok) {
                    return {ok: true, token: token};
                } else {
                    return {ok: false};
                }
            })
    }

}

/**
 * If there is a user token present, returns the resolved user object. The function adds a property
 * ok which will contain true if the user token is present and valid. It will contain false if either the token
 * is not present or is invalid.
 * @returns {Promise<{ok: boolean}>|Promise<Awaited<{ok: boolean}>>}
 */
export function getUser() {

    const token = getRawUserToken();
    if (token == null) {
        return Promise.resolve({ok: false});
    } else {
        return validateUserToken(token);
    }
}

function getRawUserToken() {
    const cookie = cookies().get('token');
    return cookie == null ? null : cookie.value;
}

function validateUserToken(token) {

    const opts = decorateRequestWithUserToken(getOpts(), token);
    return fetch( `${getServerApiBaseUri()}/user`, opts)
        .then((r) => {
            if (!r.ok) {
                return {ok: false};
            }
            return r.json()
                .then((j) => {
                    j.ok = true;
                    return j;
                });
        });
}
