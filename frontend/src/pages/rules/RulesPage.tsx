import { useEffect, useState } from "react";
import styles from "./RulesPage.module.css";
import { RulesList } from "./RulesList";
import { getRules, type RuleResponse } from "../../shared/api/rules.api";
import { type Rule } from "./rules.utils";

function toRule(r: RuleResponse): Rule {
    return {
        code: r.code,
        title: r.title,
        content: r.content,
        sortOrder: r.sortOrder,
    };
}

export function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getRules()
            .then((data) =>
                setRules(data.map(toRule).sort((a, b) => a.sortOrder - b.sortOrder)),
            )
            .catch(() => setError("Ошибка загрузки правил"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.loading}>Загрузка…</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!rules.length) return <div className={styles.empty}>Правила не найдены</div>;

    return <RulesList rules={rules} />;
}
