'use client';
import styles from '../globals.css'
import { useRouter } from 'next/navigation'

/**
 * Provides a button to allow the user to redirect to the OIDC server.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function LoginRedirect() {

    const router = useRouter();

    const handleClick = () => {
       router.push("/api/login");
    }

    return (
        <button style={styles.button} onClick={handleClick}>Go to login screen</button>
    );
}