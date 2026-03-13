// frontend/src/shared/api/training-join.api.ts
import { http } from "./http";

/**
 * Записаться на тренировку.
 * POST /api/training-sessions/{id}/join
 */
export function joinTrainingSession(id: string): Promise<void> {
    return http.post(`/training-sessions/${id}/join`).then(() => undefined);
}

/**
 * Отменить запись.
 * POST /api/training-sessions/{id}/cancel
 */
export function cancelTrainingSession(id: string): Promise<void> {
    return http.post(`/training-sessions/${id}/cancel`).then(() => undefined);
}
