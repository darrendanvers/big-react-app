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
export default function Perm({permission, permitted, notPermitted}) {

    return getUserPermissions().then((p) => {

        if (p.ok) {
            if (!p.permissions.includes(permission)) {
                return notPermitted;
            } else {
                return permitted;
            }
        } else {
            return <Error message={p.message} />
        }
    });
}
