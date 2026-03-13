export type BackNavigationState = {
    backTo?: string;
};

export function readBackTo(state: unknown): string | undefined {
    if (!state || typeof state !== "object") return undefined;

    const { backTo } = state as BackNavigationState;
    return typeof backTo === "string" ? backTo : undefined;
}
