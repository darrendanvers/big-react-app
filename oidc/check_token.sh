#! /bin/sh

source .secret.env
source .last_verifier.env

ENCODED_AUTH=$(echo "oidc_client:${CLIENT_SECRET}\c" | base64)

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Basic ${ENCODED_AUTH}" \
-d "grant_type=authorization_code&code=${1}&code_verifier=${CODE_VERIFIER}"  "http://localhost:3000/token" \
| python3 -m json.tool
