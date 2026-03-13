// frontend/src/pages/mySchedule/api/mySchedule.api.ts
import { http } from "../../../shared/api/http";
import type { MyScheduleItem } from "../model/mySchedule.types";

/**
 * Моё расписание: тренировки, на которые записан текущий пользователь.
 *
 * Backend:
 * - GET /api/account/schedule?from=...&to=...
 *
 * from/to — ISO-8601 (OffsetDateTime), параметры опциональны.
 */
export async function fetchMySchedule(params?: {
    from?: string;
    to?: string;
}): Promise<MyScheduleItem[]> {
    const response = await http.get<MyScheduleItem[]>("/account/schedule", {
        params: {
            ...(params?.from ? { from: params.from } : null),
            ...(params?.to ? { to: params.to } : null),
        },
    });

    return response.data ?? [];
}

export async function requestMyScheduleCancellation(sessionId: string): Promise<void> {
    await http.post(`/account/schedule/${sessionId}/cancel-request`);
}
