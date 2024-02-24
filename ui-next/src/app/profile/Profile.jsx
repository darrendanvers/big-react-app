import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

/**
 * Displays a logged-in user's details.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default async function Profile() {

    const session = await getServerSession(authOptions)
    if (session == null) {
        return <><p>No session</p></>
    }

    return <><p>{session.user.name}</p></>
}