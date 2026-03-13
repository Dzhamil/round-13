import styles from "./HomeNewsSection.module.css";
import type { HomeNewsItem } from "../model/homeNews.types";
import { NewsCard } from "../NewsCard";
import { formatHomeNewsDate } from "../homeNews.helpers";

type HomeNewsSectionProps = {
    news: HomeNewsItem[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
};

export function HomeNewsSection(props: HomeNewsSectionProps) {
    const { news, isLoading, error, onRetry } = props;

    return (
        <section className={styles.section} aria-labelledby="home-news-title">
            <header className={styles.sectionHeader}>
                <span className={styles.eyebrow}>Лента клуба</span>

                <div className={styles.titleRow}>
                    <h1 id="home-news-title" className={styles.title}>
                        Новости клуба
                    </h1>

                    {!isLoading && (
                        <button type="button" className={styles.refreshButton} onClick={onRetry}>
                            Обновить
                        </button>
                    )}
                </div>

                <p className={styles.subtitle}>
                    Анонсы, изменения по залу и важные обновления теперь приходят с backend, без
                    ручных моков на главной.
                </p>
            </header>

            {isLoading && <div className={styles.stateCard}>Загружаем последние новости клуба…</div>}

            {!isLoading && error && (
                <div className={styles.stateCard}>
                    {error}
                </div>
            )}

            {!isLoading && !error && !news.length && (
                <div className={styles.stateCard}>
                    Новостей пока нет. Как только администратор опубликует первую запись, она
                    появится здесь.
                </div>
            )}

            {!isLoading && !error && news.length > 0 && (
                <div className={styles.list}>
                    {news.map((item) => (
                        <NewsCard
                            key={item.id}
                            title={item.title}
                            text={item.excerpt}
                            date={formatHomeNewsDate(item.publishedAt)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
