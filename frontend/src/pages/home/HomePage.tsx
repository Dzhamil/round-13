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

    return (
        <div className={styles.page}>
            <div className={styles.menuPanel}>
                <RadialMenu />
            </div>

            <div className={styles.lowerZone}>
                <div className={styles.menuCaption}>Катя молодец!</div>
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
