import {LoginRedirect} from "@/common/auth/LoginRedirect";
import {getValidatedRawToken} from "@/util/user";
import React from "react";

/**
 * Describes the parameters for the Authenticated component.
 */
interface AuthenticatedParameterType {
    message: string,
    children: React.ReactNode
}

/**
 * Intended to wrap the entire application. It manages initiating the login flow
 * and adding the logged-in user's details to the context.
 *
 * @param message The message to show
 * @param children The elements containing the rest of the application.
 * @returns {React.JSX.Element}
 * @constructor
 */
export default async function Authenticated({message, children}: AuthenticatedParameterType): Promise<React.JSX.Element> {

    const token = await getValidatedRawToken();
    if (token == null) {
        return <LoginRedirect />
    }

    return <><p>{message}</p>{children}</>
}