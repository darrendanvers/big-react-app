import Profile from "@/app/profile/Profile";
import Navbar from "@/common/Navbar";
import React from "react";

/**
 * Primary component for the profile route.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserProfile(): React.JSX.Element {

    return (
        <>
            <Navbar />
            <Profile />
        </>
    )
}