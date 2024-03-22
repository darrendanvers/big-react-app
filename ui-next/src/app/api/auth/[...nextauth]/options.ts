import {AuthOptions} from "next-auth"
import {Pool} from 'pg';


import {Adapter} from "next-auth/adapters";
import PostgresAdapter from "@auth/pg-adapter";
import {ExtendedSession} from "@/app/api/auth/[...nextauth]/types";

/**
 * Auth framework DB pool.
 */
const pool = new Pool({
    user: process.env.APP_AUTH_DB_USER,
    host: process.env.APP_AUTH_DB_HOST,
    database: process.env.APP_AUTH_DB_DB,
    password: process.env.APP_AUTH_DB_PASSWORD,
    port: process.env.APP_AUTH_DB_PORT,
});

// I can't figure out how to do this without the cast.
const adapter:Adapter = <Adapter>PostgresAdapter(pool);

/**
 * Configuration options for Next Auth.
 *
 * @type AuthOptions
 */
const authOptions: AuthOptions = {
    adapter: adapter,
    session: {strategy: 'jwt'},
    providers: [
        {
            id: 'local',
            name: "Local Provider",
            type: 'oauth',
            wellKnown: process.env.LOCAL_OIDC_WELL_KNOWN,
            authorization: { params: {scope: 'openid'}},
            idToken: true,
            checks: ['pkce'],
            profile(profile) {
                // Pull profile information from the OIDC server's response.
                return {
                    id: profile.sub,
                    name: profile.sub
                }
            },

            clientId: process.env.APP_LOCAL_OIDC_CLIENT_ID,
            clientSecret: process.env.APP_LOCAL_OIDC_CLIENT_SECRET,
        }
    ],
    callbacks: {
        async session({ session, token, user }) {
            let extendedSession: ExtendedSession = session
            // Add the raw JWT (added to the user token below) to the user's session.
            extendedSession.idToken = token.idToken as string;
            return extendedSession
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            // Add the raw JWT to the Next Auth internal token.
            if (account) {
                token.idToken = account.id_token;
            }
            return token;
        },
    }
};

export default authOptions;