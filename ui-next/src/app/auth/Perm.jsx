import {getUserPermissions} from "@/util/user";
import {Error} from "@/common/Error";

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