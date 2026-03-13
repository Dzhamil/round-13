import styles from "../AdminRulesPage.module.css";
import type { RuleResponse } from "../../../../shared/api/adminRules.api";

type Props = {
    rule: RuleResponse;
    onEdit: (rule: RuleResponse) => void;
    onDelete: (id: string) => void;
};

export function AdminRuleItem({ rule, onEdit, onDelete }: Props) {
    return (
        <div className={styles.item}>
            <div className={styles.itemTop}>
                <div>
                    <div className={styles.itemTitle}>{rule.title}</div>
                    <div className={styles.itemMeta}>Порядок: {rule.order}</div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.button} onClick={() => onEdit(rule)}>
                        Редактировать
                    </button>
                    <button className={styles.button} onClick={() => onDelete(rule.id)}>
                        Удалить
                    </button>
                </div>
            </div>

            <div>{rule.content}</div>
        </div>
    );
}
