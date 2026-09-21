import styles from "./Schedule2Page.module.css";
import { IncomingVerification } from "./IncomingVerification";

export function Schedule2Page() {
    return (
        <section className={styles.page} aria-labelledby="schedule-2-title">
            <h1 id="schedule-2-title" className={styles.title}>Расписание 2.0</h1>
            <IncomingVerification />
            <p className={styles.empty}>Расписание пока пусто.</p>
        </section>
    );
}
