import {cookies} from "next/headers";
import {decorateRequestWithUserToken, getOpts} from "@/util/http";

/**
 * If a user's token is present as a cookie, this method will validate the token. It will add a boolean property to
 * the token, ok, to indicate the token has been validated. If there is no token, or it is not valid, the
 * ok property will be false. The result is returned as a Promise as the token is validated with an external resource.
 *
 * @returns {Promise<{ok: boolean}>|Promise<Awaited<{ok: boolean}>>}
 */
export function getUserToken() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (token == null) {
        return Promise.resolve({ok: false});
    } else {
        return validateUserToken(token.value);
    }
}

function validateUserToken(token) {

    const opts = decorateRequestWithUserToken(getOpts(), token);
    return fetch('http://localhost:5556/user', opts).then((r) => {

        if (!r.ok) {
            return {ok: false};
        }
        return r.json()
            .then((j) => {
                j.ok = true;
                return j;
            })
    });
}