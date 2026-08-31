import styles from "./Schedule2Page.module.css";

export function Schedule2Page() {
    return (
        <section className={styles.page} aria-labelledby="schedule-2-title">
            <div className={styles.card}>
                <h1 className={styles.title} id="schedule-2-title">Расписание 2.0</h1>
                <p className={styles.message}>Тестовая страница нового расписания.</p>
            </div>
        </section>
    );
}
