export type Rule = {
    code: string;
    title: string;
    content: string;
    sortOrder: number;
};

export type RulesSection = {
    key: string;
    title: string;
    rules: Rule[];
};

function detectSection(title: string): { key: string; title: string } {
    const t = title.toLowerCase();

    if (t.includes("поведен") || t.includes("этик") || t.includes("дисциплин")) {
        return { key: "behavior", title: "Поведение / Этика" };
    }
    if (t.includes("посещ") || t.includes("тренир")) {
        return { key: "trainings", title: "Посещение тренировок" };
    }
    if (t.includes("очк") || t.includes("начислен") || t.includes("балл")) {
        return { key: "points", title: "Начисление очков" };
    }
    if (t.includes("штраф") || t.includes("санкц")) {
        return { key: "penalties", title: "Штрафные санкции" };
    }
    return { key: "other", title: "Прочее" };
}

export function groupRulesToSections(rules: Rule[]): RulesSection[] {
    const sorted = [...rules].sort((a, b) => a.sortOrder - b.sortOrder);

    const map = new Map<string, RulesSection>();

    for (const rule of sorted) {
        const section = detectSection(rule.title);
        const existing = map.get(section.key);
        if (existing) {
            existing.rules.push(rule);
        } else {
            map.set(section.key, { key: section.key, title: section.title, rules: [rule] });
        }
    }

    const order = ["behavior", "trainings", "points", "penalties", "other"];
    return Array.from(map.values()).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}
