import { http } from "./http";

export type RuleResponse = {
    id: string;
    code: string;
    title: string;
    content: string;
    sortOrder: number;
};

export type UpsertRuleRequest = {
    code: string;
    title: string;
    content: string;
    sortOrder: number;
};

export function getAdminRules(): Promise<RuleResponse[]> {
    return http.get<RuleResponse[]>("/admin/rules").then(r => r.data);
}

export function createRule(payload: UpsertRuleRequest): Promise<string> {
    return http.post<string>("/admin/rules", payload).then(r => r.data);
}

export function updateRule(id: string, payload: UpsertRuleRequest): Promise<void> {
    return http.put<void>(`/admin/rules/${id}`, payload).then(() => undefined);
}

export function deleteRule(id: string): Promise<void> {
    return http.delete<void>(`/admin/rules/${id}`).then(() => undefined);
}
