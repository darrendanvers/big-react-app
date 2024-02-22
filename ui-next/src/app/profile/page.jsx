import Profile from "@/app/profile/Profile";
import Navbar from "@/common/Navbar";

/**
 * Primary component for the profile route.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserProfile() {

    return (
        <>
            <Navbar />
            <Profile />
        </>
    )
}