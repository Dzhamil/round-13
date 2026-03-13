import styles from "../AdminRulesPage.module.css";
import { RuleFormFields } from "./RuleFormFields";
import { RuleFormActions } from "./RuleFormActions";
import type { UpsertRuleRequest } from "../../../../shared/api/adminRules.api";

export type RuleFormState = UpsertRuleRequest & { id?: string };

type Props = {
    open: boolean;
    form: RuleFormState;
    onChange: (next: RuleFormState) => void;
    onClose: () => void;
    onSave: () => void;
};

export function RuleFormModal({ open, form, onChange, onClose, onSave }: Props) {
    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalTitle}>
                    {form.id ? "Редактирование правила" : "Новое правило"}
                </div>

                <RuleFormFields form={form} onChange={onChange} />
                <RuleFormActions form={form} onClose={onClose} onSave={onSave} />
            </div>
        </div>
    );
}
