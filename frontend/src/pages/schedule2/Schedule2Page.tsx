import { useState } from "react";
import styles from "./Schedule2Page.module.css";

const SCHEDULE_TABS = ["День", "Неделя", "Месяц"] as const;

type ScheduleTab = (typeof SCHEDULE_TABS)[number];

export function Schedule2Page() {
    const [activeTab, setActiveTab] = useState<ScheduleTab>("День");

    return (
        <section className={styles.page} aria-labelledby="schedule-2-title">
            <header className={styles.header}>
                <h1 className={styles.title} id="schedule-2-title">Расписание 2.0</h1>

                <div className={styles.tabs} role="tablist" aria-label="Период расписания">
                    {SCHEDULE_TABS.map((tab) => (
                        <button
                            className={styles.tab}
                            data-active={activeTab === tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>
        </section>
    );
}
