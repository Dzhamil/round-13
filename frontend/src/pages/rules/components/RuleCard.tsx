import styles from "../RulesPage.module.css";

type Props = {
    title: string;
    content: string;
};

export function RuleCard({ title, content }: Props) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardContent}>{content}</div>
        </div>
    );
}
