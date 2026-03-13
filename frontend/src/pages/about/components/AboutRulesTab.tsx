import styles from "../AboutPage.module.css";
import { groupRulesToSections, type Rule } from "../../rules/rules.utils";

type AboutRulesTabProps = {
    rules: Rule[];
    loading: boolean;
    error: string | null;
};

export function AboutRulesTab(props: AboutRulesTabProps) {
    const { rules, loading, error } = props;

    if (loading) {
        return <div className={styles.stateInline}>Загружаем правила клуба…</div>;
    }

    if (error) {
        return <div className={styles.stateInline}>{error}</div>;
    }

    if (!rules.length) {
        return <div className={styles.stateInline}>Правила пока не добавлены.</div>;
    }

    const sections = groupRulesToSections(rules);

    return (
        <div className={styles.sectionStack}>
            {sections.map((section) => (
                <section key={section.key} className={styles.ruleSection}>
                    <h3 className={styles.ruleSectionTitle}>{section.title}</h3>
                    <div className={styles.cardGrid}>
                        {section.rules.map((rule) => (
                            <article key={rule.code} className={styles.infoCard}>
                                <h4 className={styles.infoCardTitle}>{rule.title}</h4>
                                <p className={styles.infoCardText}>{rule.content}</p>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
