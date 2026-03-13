import styles from "../AboutPage.module.css";
import { splitTextToParagraphs } from "../aboutPage.helpers";
import type { InfoPageResponse } from "../model/about.types";

type AboutOverviewTabProps = {
    page: InfoPageResponse;
};

export function AboutOverviewTab(props: AboutOverviewTabProps) {
    const { page } = props;
    const paragraphs = splitTextToParagraphs(page.content);

    return (
        <div className={styles.richText}>
            {paragraphs.length ? (
                paragraphs.map((paragraph, index) => (
                    <p key={`${page.code}-paragraph-${index}`} className={styles.paragraph}>
                        {paragraph}
                    </p>
                ))
            ) : (
                <p className={styles.paragraph}>
                    Добавьте описание клуба в админке.
                </p>
            )}
        </div>
    );
}
