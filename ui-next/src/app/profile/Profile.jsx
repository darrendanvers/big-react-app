import {getUserToken} from "@/util/user";

/**
 * Displays a logged-in user's details.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default async function Profile() {

    const userToken = await getUserToken();

    let userData = "";
    if (userToken.ok) {
        userData = userToken.sub;
    } else {
        userData = "error fetching user";
    }

    return(
        <>{userData}</>
    )
}