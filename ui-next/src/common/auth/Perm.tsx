import {getUserPermissions} from "@/util/user";
import {Error} from "@/common/Error";
import React from "react";

/**
 * Describes the parameters for the Perm component.
 */
interface PermParameterType {
    permission: string,
    permitted: React.ReactNode,
    notPermitted: React.ReactNode
}

/**
 * Can be used to wrap a component that requires the user to have a specific permission. This component should be
 * used inside Authenticated to ensure that there is a logged-in user.
 *
 * @param permission The permission to determine if the user has.
 * @param permitted The action to take if the user has the permission.
 * @param notPermitted The  action to take if the user does not have the permission.
 * @returns {Promise<React.JSX.Element>}
 * @constructor
 */
export default function Perm({permission, permitted, notPermitted}: PermParameterType): Promise<React.ReactNode> {

    return getUserPermissions().then((p) => {

        if (p.data) {
            if (!p.data.permissions.includes(permission)) {
                return notPermitted;
            } else {
                return permitted;
            }
        } else {
            const errorMessage = p.error ? p.error.message : "unknown error";
            return <Error message={errorMessage} />
        }
    });
}
