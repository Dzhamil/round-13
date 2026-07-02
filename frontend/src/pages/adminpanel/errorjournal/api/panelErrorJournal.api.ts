import { panelHttp } from "../../../../shared/api/panelHttp";

export type ErrorJournalStatus = "OPEN" | "RESOLVED" | "IGNORED";
export type ErrorJournalSeverity = "ERROR" | "CRITICAL" | "CLIENT_ERROR";
export type ErrorJournalSource = "BACKEND" | "FRONTEND";

export type ErrorJournalFilters = {
    status?: ErrorJournalStatus | "ALL";
    severity?: ErrorJournalSeverity | "ALL";
    source?: ErrorJournalSource | "ALL";
    httpStatus?: string;
    from?: string;
    to?: string;
    path?: string;
    errorCode?: string;
    q?: string;
};

export type ErrorJournalListItem = {
    id: string;
    occurredAt: string;
    severity: ErrorJournalSeverity;
    source: ErrorJournalSource;
    status: ErrorJournalStatus;
    errorCode: string | null;
    httpStatus: number | null;
    exceptionClass: string | null;
    message: string | null;
    requestMethod: string | null;
    requestPath: string | null;
    actorUserId: string | null;
    panelAdminId: string | null;
    requestId: string | null;
    fingerprint: string;
};

export type ErrorJournalPage = {
    items: ErrorJournalListItem[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
};

export type ErrorJournalDetail = ErrorJournalListItem & {
    createdAt: string | null;
    errorType: string | null;
    stackTrace: string | null;
    queryString: string | null;
    remoteAddr: string | null;
    userAgent: string | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
    resolvedByUserId: string | null;
};

const RESPONSE_ERROR = "Некорректный ответ сервера журнала ошибок";

function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

function isStringOrNull(value: unknown): value is string | null {
    return typeof value === "string" || value === null;
}

function isNumberOrNull(value: unknown): value is number | null {
    return typeof value === "number" || value === null;
}

function parseListItem(value: unknown): ErrorJournalListItem {
    if (!isObject(value)) {
        throw new Error(RESPONSE_ERROR);
    }

    if (
        typeof value.id !== "string" ||
        typeof value.occurredAt !== "string" ||
        typeof value.severity !== "string" ||
        typeof value.source !== "string" ||
        typeof value.status !== "string" ||
        !isStringOrNull(value.errorCode) ||
        !isNumberOrNull(value.httpStatus) ||
        !isStringOrNull(value.exceptionClass) ||
        !isStringOrNull(value.message) ||
        !isStringOrNull(value.requestMethod) ||
        !isStringOrNull(value.requestPath) ||
        !isStringOrNull(value.actorUserId) ||
        !isStringOrNull(value.panelAdminId) ||
        !isStringOrNull(value.requestId) ||
        typeof value.fingerprint !== "string"
    ) {
        throw new Error(RESPONSE_ERROR);
    }

    return value as ErrorJournalListItem;
}

function parsePage(value: unknown): ErrorJournalPage {
    if (!isObject(value) || !Array.isArray(value.items)) {
        throw new Error(RESPONSE_ERROR);
    }

    if (
        typeof value.page !== "number" ||
        typeof value.size !== "number" ||
        typeof value.totalItems !== "number" ||
        typeof value.totalPages !== "number"
    ) {
        throw new Error(RESPONSE_ERROR);
    }

    return {
        items: value.items.map(parseListItem),
        page: value.page,
        size: value.size,
        totalItems: value.totalItems,
        totalPages: value.totalPages,
    };
}

function parseDetail(value: unknown): ErrorJournalDetail {
    const base = parseListItem(value);
    const item = value as Record<string, unknown>;
    if (
        !isStringOrNull(item.createdAt) ||
        !isStringOrNull(item.errorType) ||
        !isStringOrNull(item.stackTrace) ||
        !isStringOrNull(item.queryString) ||
        !isStringOrNull(item.remoteAddr) ||
        !isStringOrNull(item.userAgent) ||
        !isStringOrNull(item.resolutionNote) ||
        !isStringOrNull(item.resolvedAt) ||
        !isStringOrNull(item.resolvedByUserId)
    ) {
        throw new Error(RESPONSE_ERROR);
    }

    return {
        ...base,
        createdAt: item.createdAt,
        errorType: item.errorType,
        stackTrace: item.stackTrace,
        queryString: item.queryString,
        remoteAddr: item.remoteAddr,
        userAgent: item.userAgent,
        resolutionNote: item.resolutionNote,
        resolvedAt: item.resolvedAt,
        resolvedByUserId: item.resolvedByUserId,
    };
}

function appendParam(params: URLSearchParams, key: string, value: string | undefined): void {
    if (value && value.trim()) {
        params.set(key, value.trim());
    }
}

function appendDateParam(params: URLSearchParams, key: string, value: string | undefined): void {
    if (!value || !value.trim()) {
        return;
    }

    const date = new Date(value);
    params.set(key, Number.isNaN(date.getTime()) ? value.trim() : date.toISOString());
}

function toQuery(filters: ErrorJournalFilters, page: number, size: number): string {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    if (filters.status && filters.status !== "ALL") {
        params.set("status", filters.status);
    }
    if (filters.severity && filters.severity !== "ALL") {
        params.set("severity", filters.severity);
    }
    if (filters.source && filters.source !== "ALL") {
        params.set("source", filters.source);
    }

    appendParam(params, "httpStatus", filters.httpStatus);
    appendDateParam(params, "from", filters.from);
    appendDateParam(params, "to", filters.to);
    appendParam(params, "path", filters.path);
    appendParam(params, "errorCode", filters.errorCode);
    appendParam(params, "q", filters.q);

    return params.toString();
}

export async function fetchErrorJournal(filters: ErrorJournalFilters, page: number, size: number): Promise<ErrorJournalPage> {
    const res = await panelHttp.get<unknown>(`/panel/error-journal?${toQuery(filters, page, size)}`);
    return parsePage(res.data);
}

export async function fetchErrorJournalDetail(id: string): Promise<ErrorJournalDetail> {
    const res = await panelHttp.get<unknown>(`/panel/error-journal/${id}`);
    return parseDetail(res.data);
}

export async function updateErrorJournalStatus(
    id: string,
    status: ErrorJournalStatus,
    note: string,
): Promise<ErrorJournalDetail> {
    const res = await panelHttp.patch<unknown>(`/panel/error-journal/${id}/status`, { status, note });
    return parseDetail(res.data);
}
