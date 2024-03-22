import {Session} from "next-auth";

/**
 * Extends the default NextAuth session to contain the JWT.
 */
export interface ExtendedSession extends Session {
    idToken?: string
}