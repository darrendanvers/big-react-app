import * as crypto from "crypto";
import open from "open";
import * as fs from "fs";

/**
 * Persists the verification code to an environment file.
 *
 * @param verifier The verification code to save.
 */
function writeVerifierToFile(verifier) {
    fs.writeFile('.last_verifier.env', `CODE_VERIFIER=${verifier}`, err => {
        if (err) {
            console.error(`Unable to write nonce to file: ${err}`);
        }
    });
}

// Generate a verification code and challenge code.
// https://datatracker.ietf.org/doc/html/rfc7636#section-4.1.
const verifier = crypto.randomBytes(32)
    .toString('base64url');
const challenge = crypto.createHash('sha256')
    .update(verifier)
    .digest('base64url');

// The URL to navigate to.
const url = `http://localhost:3000/auth?\
client_id=oidc_client&\
response_type=code&\
response_mode=query\
&redirect_uri=http://localhost:8080/api&\
code_challenge=${challenge}&\
code_challenge_method=S256&scope=openid`


open(url)
    .then(() => writeVerifierToFile(verifier));