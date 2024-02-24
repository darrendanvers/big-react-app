import NextAuth from "next-auth"

/**
 * Configuration options for Next Auth.
 *
 * @type {{callbacks: {session({session: *, token: *, user: *}): Promise<*>, jwt({token: *, user: *, account: *, profile: *, isNewUser: *}): Promise<*>}, providers: [{authorization: {params: {scope: string}}, wellKnown: string, checks: string[], clientId: string, profile(*): {name: *, id: *}, name: string, idToken: boolean, clientSecret: string, id: string, type: string}]}}
 */
export const authOptions = {
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

            clientId: 'node_client',
            clientSecret: process.env.LOCAL_OIDC_CLIENT_SECRET,
        }
    ],
    callbacks: {
        async session({ session, token, user }) {
            // Add the raw JWT (added to the user token below) to the user's session.
            session.idToken = token.idToken;
            return session
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
