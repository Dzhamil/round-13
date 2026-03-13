import styles from "./RulesPage.module.css";
import { RuleCard, RulesHeader } from "./components";
import { groupRulesToSections, type Rule } from "./rules.utils";

type Props = {
    rules: Rule[];
};

export function RulesList({ rules }: Props) {
    const sections = groupRulesToSections(rules);

    return (
        <div className={styles.root}>
            <RulesHeader title="Правила клуба" />

            {sections.map(section => (
                <div key={section.key} className={styles.section}>
                    <h3 className={styles.sectionTitle}>{section.title}</h3>
                    {section.rules.map(rule => (
                        <RuleCard
                            key={rule.code}
                            title={rule.title}
                            content={rule.content}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
