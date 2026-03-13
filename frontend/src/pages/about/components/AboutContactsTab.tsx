import styles from "../AboutPage.module.css";
import { parseContactsContent, splitTextToParagraphs } from "../aboutPage.helpers";
import type { InfoPageResponse } from "../model/about.types";

type AboutContactsTabProps = {
    page: InfoPageResponse | null;
    loading: boolean;
    error: string | null;
};

export function AboutContactsTab(props: AboutContactsTabProps) {
    const { page, loading, error } = props;

    if (loading) {
        return <div className={styles.stateInline}>Загружаем контакты клуба…</div>;
    }

    if (error) {
        return <div className={styles.stateInline}>{error}</div>;
    }

    if (!page || !page.content.trim()) {
        return (
            <div className={styles.stateInline}>
                Контакты клуба пока не опубликованы.
            </div>
        );
    }

    const contactCards = parseContactsContent(page);
    const paragraphs = splitTextToParagraphs(page.content);

    return (
        <div className={styles.sectionStack}>
            {contactCards.length > 0 ? (
                <div className={styles.cardGrid}>
                    {contactCards.map((card) => (
                        <article key={`${card.title}-${card.value}`} className={styles.infoCard}>
                            <h3 className={styles.infoCardTitle}>{card.title}</h3>
                            <p className={styles.contactValue}>{card.value}</p>
                            {card.hint && <p className={styles.infoCardText}>{card.hint}</p>}
                        </article>
                    ))}
                </div>
            ) : (
                <div className={styles.richText}>
                    {paragraphs.map((paragraph, index) => (
                        <p key={`contacts-paragraph-${index}`} className={styles.paragraph}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
