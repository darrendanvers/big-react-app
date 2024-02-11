'use client';
import useSWR from 'swr'
import {LoginRedirect} from "@/app/auth/LoginRedirect";
import React from "react";

const UserContext = React.createContext(null);
export { UserContext };

/**
 * Intended to wrap the entire application. It manages initiating the login flow
 * and adding the logged-in user's details to the context.
 *
 * @param children The elements containing the rest of the application.
 * @returns {JSX.Element}
 * @constructor
 */
export default function Authenticated({children}) {

    // Handles the response from the endpoint that returns a user's details.
    const fetcher = async url => {
        const res = await fetch(url)
        if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.')
            error.status = res.status
            throw error
        }

        return res.json()
    }
    // Call the API to get the user's details.
    const { data, error, isLoading } = useSWR("/api/user", fetcher);

    if (isLoading) return <div>Loading...</div>
    if (error) return <LoginRedirect />
    return <UserContext.Provider value={data}>{children}</UserContext.Provider>
}