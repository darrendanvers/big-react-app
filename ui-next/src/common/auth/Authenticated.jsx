import {LoginRedirect} from "@/common/auth/LoginRedirect";
import {getValidatedRawToken} from "@/util/user";

/**
 * Intended to wrap the entire application. It manages initiating the login flow
 * and adding the logged-in user's details to the context.
 *
 * @param message The message to show
 * @param children The elements containing the rest of the application.
 * @returns {JSX.Element}
 * @constructor
 */
export default async function Authenticated({message, children}) {

    const token = await getValidatedRawToken();
    if (token == null) {
        return <LoginRedirect />
    }

    return <><p>{message}</p>{children}</>
}