'use client';
import styles from '../globals.css';
import { useRouter } from 'next/navigation';
import {useEffect, useState} from "react";

/**
 * Provides a button to allow the user to redirect to the OIDC server.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function LoginRedirect() {

    const [location, setLocation] = useState('');
    const router = useRouter();

    useEffect(function mount() {
        setLocation(window.location.href);
    }, [])

    const handleClick = () => {
       router.push(`/api/login?relay=${encodeURIComponent(location)}`);
    }

    return (
        <button style={styles.button} onClick={handleClick}>Go to login screen</button>
    );
}