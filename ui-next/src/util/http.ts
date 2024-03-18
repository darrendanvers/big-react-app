import {getRawUserToken} from "@/util/user";
import { context, propagation } from '@opentelemetry/api';
import {logger} from "@/util/logging";

/**
 * Holds details of an error returned from an HTTP call.
 */
export interface HttpResponseError {
    message: string
}

/**
 * Normalizes the response from an HTTP call.
 */
export interface HttpResponseWrapper<T> {
    ok: boolean
    status?: number,
    error?: HttpResponseError,
    unauthenticated: boolean,
    unauthorized: boolean,
    data?: T
}

/**
 * The common HTTP request headers this application sets.
 */
type RequestHeaders = {
    traceparent?: string,
    tracestate?: string,
    Authorization?: string,
}

/**
 * HTTP level details of an HTTP call.
 */
type RequestOptions = {
    method: string,
    headers: RequestHeaders
}

/**
 * Normalizes the details of an HTTP call.
 */
type CallInterface = {
    fullUri: string,
    requestOptions: RequestOptions
}

/**
 * Performs an HTTP GET request to a URI. If there is a logged-in user, the user's login token will be added
 * to the request.
 *
 * @param uri The URI to retrieve. It should be relative to the API server as seen from the backend and include any
 * needed parameters.
 * @returns {Promise<*>}
 */
export function get<T>(uri: string): Promise<HttpResponseWrapper<T>> {

    logger.info(`Getting stuff from ${uri}.`);
    return getRawUserToken()
        .then((token) => {

            const opts = decorateRequest(getOpts(), token);
            const fullUri = `${getServerApiBaseUri()}/${uri}`;


            return {requestOptions: opts, fullUri: fullUri};
        }).then((callInfo: CallInterface) => fetch(callInfo.fullUri, callInfo.requestOptions))
        .then(r => decorateResponse<T>(r))
        .catch(e => handleErrorResponse<T>(e));
}


// Returns the path to the API server.
function getServerApiBaseUri(): string {
    return process.env.APP_SERVER_API_BASE_URI;
}

// Returns an object that can be passed to a fetch() request to trigger an HTTP GET request.
function getOpts(): RequestOptions  {
    return {method: "GET", headers: {}};
}

// Adds various headers to the request options.
function decorateRequest(opts: RequestOptions, token: string|null) {
    opts.headers = {};
    decorateRequestWithTraceParent(opts);
    decorateRequestWithUserToken(opts, token);
    return opts;
}

// If inside an active span, adds a traceparent and tracestate headers to the request options.
function decorateRequestWithTraceParent(opts: RequestOptions): RequestOptions {

    const output = {
        traceparent: null,
        tracestate: null
    };

    propagation.inject(context.active(), output);

    if (output.traceparent != null) {
        opts.headers.traceparent = output.traceparent;
    }
    if (output.tracestate != null) {
        opts.headers.tracestate = output.tracestate;
    }
    return opts
}

// If there is a user token, adds it as an authorization header.
function decorateRequestWithUserToken(opts: RequestOptions, token: string|null) {

    if (token != null) {
        opts.headers.Authorization = `Bearer ${token}`;
    }
    return opts;
}

export function decorateResponse<T>(r: Response): Promise<HttpResponseWrapper<T>> {
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
        const httpResponseError: HttpResponseError = {message: errorMessage}
        return Promise.resolve(
            {ok: false,
                error: httpResponseError,
                status: r.status,
                unauthenticated: unauthenticated,
                unauthorized: unauthorized,
                message: errorMessage});
    }
    return r.json()
        .then(j => {
            return {ok: true, status: r.status, unauthenticated: false, unauthorized: false, data: j};
        });
}

export function handleErrorResponse<T>(e: Error): Promise<HttpResponseWrapper<T>> {
    logger.error(e.message);

    return Promise.resolve({ok: false, error: {message: e.message}, unauthenticated: false, unauthorized: false})
}
