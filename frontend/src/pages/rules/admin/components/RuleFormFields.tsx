import styles from "../AdminRulesPage.module.css";
import type { RuleFormState } from "./RuleFormModal";

type Props = {
    form: RuleFormState;
    onChange: (next: RuleFormState) => void;
};

export function RuleFormFields({ form, onChange }: Props) {
    return (
        <>
            <div className={styles.row}>
                <label>Код</label>
                <input
                    className={styles.input}
                    value={form.code}
                    onChange={e => onChange({ ...form, code: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <label>Заголовок</label>
                <input
                    className={styles.input}
                    value={form.title}
                    onChange={e => onChange({ ...form, title: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <label>Текст</label>
                <textarea
                    className={styles.textarea}
                    value={form.content}
                    onChange={e => onChange({ ...form, content: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <label>Порядок</label>
                <input
                    type="number"
                    className={styles.input}
                    value={form.sortOrder}
                    onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })}
                />
            </div>
        </>
    );
}
