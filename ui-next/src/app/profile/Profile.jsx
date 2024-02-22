import {getUser, getUserPermissions} from "@/util/user";

/**
 * Displays a logged-in user's details.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default async function Profile() {

    const userToken = await getUser();
    const userPermissions = await getUserPermissions();

    let userData = "";
    if (userToken.ok) {
        userData = userToken.sub;
    } else {
        userData = "error fetching user";
    }

    let userPermissionsAsString = "";
    if (userPermissions.ok) {
        userPermissionsAsString = userPermissions.permissions;
    } else {
        userPermissionsAsString = userPermissions.message;
    }

    return(
        <>
            <p>User ID: {userData}</p>
            <p>Permissions: {userPermissionsAsString}</p>
        </>
    )
}