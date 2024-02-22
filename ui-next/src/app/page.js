import styles from "./page.module.css";
import Authenticated from "@/app/auth/Authenticated";
import Link from "next/link";
import Perm from "@/app/auth/Perm";

/**
 * The main application element.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Home() {

    return (
        <main className={styles.main}>
            <Authenticated message="Home page">
                <Link href="/profile">Profile</Link>
                <Link href="/data">Data</Link>
                <Perm permission="admin"
                      permitted={<p>Admin user.</p>}
                      notPermitted={<p>Regular user.</p>}
                />
            </Authenticated>
        </main>
    );
}
