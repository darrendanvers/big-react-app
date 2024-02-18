import styles from "./page.module.css";
import Authenticated from "@/app/auth/Authenticated";
import Link from "next/link";

/**
 * The main application element.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Home() {

    return (
        <main className={styles.main}>
            <Authenticated>
                <Link href="/profile">Profile</Link>
            </Authenticated>
        </main>
    );
}
