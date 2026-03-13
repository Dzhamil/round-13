import styles from "./HomePulseTicker.module.css";
import type { HomePulseItem } from "../model/homePulse.types";

type HomePulseTickerProps = {
    items: HomePulseItem[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
};

function renderTickerText(item: HomePulseItem): string {
    return `${item.label} • ${item.title} • ${item.meta}`;
}

export function HomePulseTicker(props: HomePulseTickerProps) {
    const { items, isLoading, error, onRetry } = props;

    if (isLoading) {
        return (
            <section className={styles.ticker} aria-label="Актуальные события клуба">
                <div className={styles.state}>Загружаем события клуба…</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.ticker} aria-label="Актуальные события клуба">
                <div className={styles.state}>
                    <span>{error}</span>
                    <button type="button" className={styles.retryButton} onClick={onRetry}>
                        Обновить
                    </button>
                </div>
            </section>
        );
    }

    if (!items.length) {
        return (
            <section className={styles.ticker} aria-label="Актуальные события клуба">
                <div className={styles.state}>В афише пока нет новых событий.</div>
            </section>
        );
    }

    const loopItems = [...items, ...items];
    const durationSeconds = Math.max(16, items.length * 7);

    return (
        <section className={styles.ticker} aria-label="Актуальные события клуба">
            <div className={styles.viewport}>
                <div
                    className={styles.track}
                    style={{ ["--ticker-duration" as string]: `${durationSeconds}s` }}
                >
                    {loopItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className={styles.item}
                            aria-hidden={index >= items.length}
                            title={renderTickerText(item)}
                        >
                            <span className={styles.itemLabel}>{item.label}</span>
                            <span className={styles.itemText}>{item.title}</span>
                            <span className={styles.itemMeta}>{item.meta}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
