'use client';
import {signIn} from "next-auth/react";
import React, {useEffect, useState} from "react";

/**
 * Presents a button that will redirect the user back to the login screen. This saves the current location so the user will
 * be redirected back here after login.
 *
 * @returns {React.JSX.Element}
 * @constructor
 */
export function LoginRedirect(): React.JSX.Element {

    const [location, setLocation] = useState<string>('');

    useEffect(() => setLocation(window.location.href), []);

    const handleClick = () => {
        signIn('local', {callbackUrl: location});
    }

    return <button onClick={handleClick}>Go to login screen</button>
}