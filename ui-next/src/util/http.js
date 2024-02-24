import {getRawUserToken} from "@/util/user";

/**
 * Returns the path to the API server.
 * @returns {string}
 */
export function getServerApiBaseUri() {
    return process.env.SERVER_API_BASE_URI;
}

/**
 * Returns an object that can be passed to a fetch() request to trigger an HTTP GET request.
 *
 * @returns {{method: string}}
 */
export function getOpts() {
    return {method: "GET"};
}

/**
 * Takes an object that is being constructed to pass as options to a fetch() request and, if token
 * is present, adds it as a cookie to the options. It will return the updated object.
 *
 * @param opts The object that will be passed as options to a fetch() call.
 * @param token The user token. If this is null or undefined, this method has no effect.
 * @returns {*}
 */
export function decorateRequestWithUserToken(opts, token) {

    if (token != null) {
        opts.headers = {
            Authorization: `Bearer ${token}`
        }
    }
    return opts;
}

/**
 * Performs an HTTP GET request to a URI. If there is a logged-in user, the user's login token will be added
 * to the request.
 *
 * @param uri The URI to retrieve. It should be relative to the API server as seen from the backend and include any
 * needed parameters.
 * @returns {Promise<*>}
 */
export function get(uri) {

    return getRawUserToken()
        .then((token) => {

            const opts = decorateRequestWithUserToken(getOpts(), token);
            const fullUri = `${getServerApiBaseUri()}/${uri}`;

            return fetch(fullUri, opts)
                .then((r) => decorateResponse(r))
                .catch((e) => handleErrorResponse(e));
        })
}

export function decorateResponse(r) {
    if (!r.ok) {
        const unauthenticated = r.status === 401;
        const unauthorized = r.status === 403;
        return {ok: false, error: false, unauthenticated: unauthenticated, unauthorized: unauthorized, message: r.statusText};
    }
    return r.json()
        .then((j) => {
            j.ok = true;
            return j;
        });
}

export function handleErrorResponse(e) {
    return Promise.resolve({ok: false, error: true, unauthenticated: false, unauthorized: false, message: e.message})
}