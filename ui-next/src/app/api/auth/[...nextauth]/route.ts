import NextAuth, {AuthOptions, Session} from "next-auth"

/**
 * Extends the default NextAuth session to contain the JWT.
 */
export interface ExtendedSession extends Session {
    idToken?: string
}

/**
 * Configuration options for Next Auth.
 *
 * @type AuthOptions
 */
export const authOptions: AuthOptions = {
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }
