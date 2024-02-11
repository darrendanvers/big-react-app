'use client';
import {UserContext} from "@/app/auth/Authenticated";
import {useContext} from "react";

/**
 * Displays a logged-in user's details.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Profile() {

    const user = useContext(UserContext);

    return (
        <div>{user.sub}</div>
    )
}