// frontend/src/pages/mySchedule/model/mySchedule.types.ts

/**
 * Тип тренировки (как отдаёт бэкенд).
 * Сейчас приходит строкой (GROUP/PERSONAL/OPEN), поэтому держим union со страховкой.
 */
export type TrainingType = "GROUP" | "PERSONAL" | "OPEN" | (string & {});

/**
 * Элемент "Моего расписания" (тренировка, на которую записан пользователь).
 * Backend: GET /api/account/schedule
 */
export type MyScheduleItem = {
    sessionId: string;

    title?: string | null;
    type: TrainingType;

    startsAt: string;
    endsAt?: string | null;

    coachId?: string | null;
    coachName?: string | null;
    coachAvatarUrl?: string | null;

    location?: string | null;

    canCancel: boolean;
};
