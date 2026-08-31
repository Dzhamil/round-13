import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMe } from "../../shared/api/account.api";
import { isCoachRole } from "../../shared/lib/roles";
import { RadialMenu } from "./RadialMenu";
import { HomePulseTicker } from "./components/HomePulseTicker";
import styles from "./HomePage.module.css";
import { useHomePulse } from "./model/useHomePulse";

/**
 * Главная страница.
 * Главный экран клуба: колесо навигации и живая строка актуальных событий.
 */
export function HomePage() {
    const { items, isLoading, error, reload } = useHomePulse();
    const [canOpenSchedule2, setCanOpenSchedule2] = useState(false);

    useEffect(() => {
        let isActive = true;

        getMe()
            .then((me) => {
                if (isActive) {
                    setCanOpenSchedule2(isCoachRole(me.role));
                }
            })
            .catch(() => {
                if (isActive) {
                    setCanOpenSchedule2(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.menuPanel}>
                <RadialMenu />
                {canOpenSchedule2 ? (
                    <Link className={styles.schedule2Button} to="/schedule-2">
                        Расписание 2.0
                    </Link>
                ) : null}
            </div>

            <div className={styles.tickerDock}>
                <HomePulseTicker
                    items={items}
                    isLoading={isLoading}
                    error={error}
                    onRetry={reload}
                />
            </div>
        </div>
    );
}
