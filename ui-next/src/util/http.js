import {getRawUserToken} from "@/util/user";
import opentelemetry from "@opentelemetry/api";
import {logger} from "@/util/logging";

/**
 * Performs an HTTP GET request to a URI. If there is a logged-in user, the user's login token will be added
 * to the request.
 *
 * @param uri The URI to retrieve. It should be relative to the API server as seen from the backend and include any
 * needed parameters.
 * @returns {Promise<*>}
 */
export function get(uri) {

    logger.info(`Getting stuff from ${uri}.`);
    return getRawUserToken()
        .then((token) => {

            const opts = decorateRequest(getOpts(), token);
            const fullUri = `${getServerApiBaseUri()}/${uri}`;

            return {opts: opts, fullUri: fullUri};
        }).then(callInfo => fetch(callInfo.fullUri, callInfo.opts))
        .then(r => decorateResponse(r))
        .catch(e => handleErrorResponse(e));
}


// Returns the path to the API server.
function getServerApiBaseUri() {
    return process.env.APP_SERVER_API_BASE_URI;
}

// Returns an object that can be passed to a fetch() request to trigger an HTTP GET request.
function getOpts() {
    return {method: "GET"};
}

// Adds various headers to the request options.
function decorateRequest(opts, token) {
    opts.headers = {};
    decorateRequestWithTraceParent(opts);
    decorateRequestWithUserToken(opts, token);
    return opts;
}

// If inside an active span, adds a traceparent header to the request options.
function decorateRequestWithTraceParent(opts) {
    const activeSpan = opentelemetry.trace.getActiveSpan();
    if (activeSpan != null) {
        opts.headers.traceparent = `00-${activeSpan.spanContext().traceId}-${activeSpan.spanContext().spanId}-00`;
    }
    return opts;
}

// If there is a user token, adds it as an authorization header.
function decorateRequestWithUserToken(opts, token) {

    if (token != null) {
        opts.headers.Authorization = `Bearer ${token}`;
    }
    return opts;
}

export function decorateResponse(r) {
    if (!r.ok) {
        let errorMessage = r.statusText;
        let unauthenticated = false;
        let unauthorized = false;
        if (r.status === 401) {
            errorMessage = 'user is unauthenticated';
            unauthenticated = true;
        }
        if (r.status === 403) {
            errorMessage = 'user does not have permission to perform this action';
            unauthorized = true;
        }
        return {ok: false, error: false, unauthenticated: unauthenticated, unauthorized: unauthorized, message: errorMessage};
    }
    return r.json()
        .then((j) => {
            j.ok = true;
            return j;
        });
}

export function handleErrorResponse(e) {
    logger.error(e.message);
    return Promise.resolve({ok: false, error: true, unauthenticated: false, unauthorized: false, message: e.message})
}
