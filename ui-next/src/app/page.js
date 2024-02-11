import styles from "./page.module.css";
import Authenticated from "@/app/auth/Authenticated";
import Profile from "@/app/auth/Profile";

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
                <Profile />
            </Authenticated>
        </main>
    );
}
