'use client';
import {signIn} from "next-auth/react";
import {useEffect, useState} from "react";

/**
 * Presents a button that will redirect the user back to the login screen. This saves the current location so the user will
 * be redirected back here after login.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function LoginRedirect() {

    const [location, setLocation] = useState('');

    useEffect(() => setLocation(window.location.href), []);

    const handleClick = () => {
        signIn('local', {callbackUrl: location});
    }

    return <button onClick={handleClick}>Go to login screen</button>
}