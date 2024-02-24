import {getUserPermissions} from "@/util/user";
import {Error} from "@/common/Error";

/**
 * Can be used to wrap a component that requires the user to have a specific permission. This component should be
 * used inside Authenticated to ensure that there is a logged-in user.
 *
 * @param permission The permission to determine if the user has.
 * @param permitted The action to take if the user has the permission.
 * @param notPermitted The  action to take if the user does not have the permission.
 * @returns {Promise<*|JSX.Element>}
 * @constructor
 */
export default async function Perm({permission, permitted, notPermitted}) {

    const userPermissions = await getUserPermissions();

    if (!userPermissions.ok) {
        const message = `Error fetching permissions ${userPermissions.message}`;
        return <Error message={message} />
    }

    if (!userPermissions.permissions.includes(permission)) {
        return notPermitted;
    }

    return permitted;
}