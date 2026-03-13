import { Link } from "react-router-dom";
import styles from "../AboutPage.module.css";
import { splitTextToParagraphs } from "../aboutPage.helpers";
import type { InfoPageResponse } from "../model/about.types";

type AboutNewcomersTabProps = {
    page: InfoPageResponse | null;
    loading: boolean;
    error: string | null;
};

export function AboutNewcomersTab(props: AboutNewcomersTabProps) {
    const { page, loading, error } = props;

    if (loading) {
        return <div className={styles.stateInline}>Загружаем информацию для новичков…</div>;
    }

    if (error) {
        return <div className={styles.stateInline}>{error}</div>;
    }

    const paragraphs = splitTextToParagraphs(page?.content ?? "");

    return (
        <div className={styles.sectionStack}>
            <div className={styles.richText}>
                {paragraphs.length ? (
                    paragraphs.map((paragraph, index) => (
                        <p key={`newcomers-${index}`} className={styles.paragraph}>
                            {paragraph}
                        </p>
                    ))
                ) : (
                    <p className={styles.paragraph}>
                        Добавьте памятку для новичков в админке.
                    </p>
                )}
            </div>

            <div className={styles.actionRow}>
                <Link className={styles.primaryAction} to="/timetable">
                    Открыть тренировки
                </Link>
                <Link className={styles.secondaryAction} to="/schedule">
                    Посмотреть афишу
                </Link>
            </div>
        </div>
    );
}
