import styles from "./page.module.css";
import Link from "next/link";
import Perm from "@/common/auth/Perm";

/**
 * The main application element.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Home() {

    return (
        <main className={styles.main}>
            <Link href="/profile">Profile</Link>
            <Link href="/data">Data</Link>
            <Perm permission="admin"
                  permitted={<p>Admin user.</p>}
                  notPermitted={<p>Regular user.</p>}
            />
        </main>
    );
}
