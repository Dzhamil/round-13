// frontend/src/pages/timetable/model/trainerSchedule.types.ts

/**
 * Тип элемента расписания тренера, соответствующий ответу бэкенда
 * TrainerScheduleItemResponse.
 *
 * Поля:
 * - sessionId: уникальный идентификатор тренировки
 * - studentId: идентификатор ученика (может отсутствовать)
 * - studentName: имя ученика, если указано
 * - startsAt: дата и время начала тренировки (ISO‑8601 строка)
 * - endsAt: дата и время окончания тренировки, если есть (ISO‑8601 строка)
 * - canCancel: можно ли отменить запись (заглушка на текущий момент)
 */
export type TrainerScheduleItem = {
    sessionId: string;
    studentId?: string | null;
    studentName?: string | null;
    startsAt: string;
    endsAt?: string | null;
    canCancel: boolean;
};