import {getUser} from "@/util/user";
import {LoginRedirect} from "@/app/auth/LoginRedirect";

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

    const userToken = await getUser();

    if (!userToken.ok) {
        return <> <p>{message}</p><LoginRedirect /> </>
    } else {
        return <><p>{message}</p>{children}</>
    }
}