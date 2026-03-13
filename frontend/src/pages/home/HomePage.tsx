import { RadialMenu } from "./RadialMenu";
import { HomeNewsSection } from "./components/HomeNewsSection";
import styles from "./HomePage.module.css";
import { useHomeNews } from "./model/useHomeNews";

/**
 * Главная страница.
 * Главный экран клуба: колесо навигации и лента актуальных новостей.
 */
export function HomePage() {
    const { news, isLoading, error, reload } = useHomeNews();

    return (
        <div className={styles.page}>
            <div className={styles.menuPanel}>
                <RadialMenu />
            </div>

            <aside className={styles.newsPanel}>
                <HomeNewsSection
                    news={news}
                    isLoading={isLoading}
                    error={error}
                    onRetry={reload}
                />
            </aside>
        </div>
    );
}
