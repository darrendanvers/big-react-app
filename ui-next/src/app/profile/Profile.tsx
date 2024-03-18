import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import React from "react";

/**
 * Displays a logged-in user's details.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default async function Profile(): Promise<React.JSX.Element> {

    const session = await getServerSession(authOptions)
    if (session == null) {
        return <><p>No session</p></>
    }

    const userName = session.user ? session.user.name : "unknown"
    return <><p>{userName}</p></>
}