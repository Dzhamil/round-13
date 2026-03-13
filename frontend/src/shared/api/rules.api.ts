import { http } from "./http";

export type RuleResponse = {
    code: string;
    title: string;
    content: string;
    sortOrder: number;
};

export function getRules(): Promise<RuleResponse[]> {
    return http.get<RuleResponse[]>("/rules").then((r) => r.data);
}
