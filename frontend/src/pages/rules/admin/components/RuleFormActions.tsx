import styles from "../AdminRulesPage.module.css";
import type { RuleFormState } from "./RuleFormModal";

type Props = {
    form: RuleFormState;
    onClose: () => void;
    onSave: () => void;
};

export function RuleFormActions({ form, onClose, onSave }: Props) {
    return (
        <div className={styles.modalActions}>
            <button className={styles.button} onClick={onClose}>
                Отмена
            </button>
            <button className={styles.button} onClick={onSave}>
                {form.id ? "Сохранить" : "Создать"}
            </button>
        </div>
    );
}
