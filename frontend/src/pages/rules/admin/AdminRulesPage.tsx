import { useEffect, useState } from "react";
import styles from "./AdminRulesPage.module.css";
import {
    getAdminRules,
    createRule,
    updateRule,
    deleteRule,
    type RuleResponse,
    type UpsertRuleRequest,
} from "../../../shared/api/adminRules.api";
import { AdminRuleItem, RuleFormModal, type RuleFormState } from "./components";

export function AdminRulesPage() {
    const [rules, setRules] = useState<RuleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<RuleFormState>({
        code: "",
        title: "",
        content: "",
        sortOrder: 0,
    });

    function load() {
        setLoading(true);
        setError(null);
        getAdminRules()
            .then(data => setRules([...data].sort((a, b) => a.sortOrder - b.sortOrder)))
            .catch(() => setError("Ошибка загрузки правил"))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setForm({ code: "", title: "", content: "", sortOrder: 0 });
        setModalOpen(true);
    }

    function openEdit(rule: RuleResponse) {
        setForm({
            id: rule.id,
            code: rule.code,
            title: rule.title,
            content: rule.content,
            sortOrder: rule.sortOrder,
        });
        setModalOpen(true);
    }

    function close() {
        setModalOpen(false);
    }

    function save() {
        const payload: UpsertRuleRequest = {
            code: form.code,
            title: form.title,
            content: form.content,
            sortOrder: form.sortOrder,
        };

        const action = form.id
            ? updateRule(form.id, payload)
            : createRule(payload).then(() => undefined);

        action
            .then(() => {
                close();
                load();
            })
            .catch(() => setError("Ошибка сохранения правила"));
    }

    function remove(id: string) {
        deleteRule(id)
            .then(load)
            .catch(() => setError("Ошибка удаления правила"));
    }

    if (loading) return <div className={styles.loading}>Загрузка…</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h2 className={styles.title}>Администрирование правил</h2>
                <button className={styles.button} onClick={openCreate}>
                    Добавить правило
                </button>
            </div>

            <div className={styles.list}>
                {rules.map(rule => (
                    <AdminRuleItem key={rule.id} rule={rule} onEdit={openEdit} onDelete={remove} />
                ))}
            </div>

            <RuleFormModal
                open={modalOpen}
                form={form}
                onChange={setForm}
                onClose={close}
                onSave={save}
            />
        </div>
    );
}
