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
            cookie: `token=${token}`
        }
    }
    return opts;
}
