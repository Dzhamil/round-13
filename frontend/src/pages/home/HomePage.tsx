import { RadialMenu } from "./RadialMenu";
import { HomeIntro } from "./components/HomeIntro";
import { HomePulseTicker } from "./components/HomePulseTicker";
import styles from "./HomePage.module.css";
import { useHomeIntro } from "./model/useHomeIntro";
import { useHomePulse } from "./model/useHomePulse";

/**
 * Главная страница.
 * Главный экран клуба: колесо навигации и живая строка актуальных событий.
 */
export function HomePage() {
    const { intro } = useHomeIntro();
    const { items, isLoading, error, reload } = useHomePulse();

    return (
        <div className={styles.page}>
            <HomeIntro intro={intro} />

            <div className={styles.menuPanel}>
                <RadialMenu />
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
