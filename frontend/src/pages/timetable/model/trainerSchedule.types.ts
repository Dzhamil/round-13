// frontend/src/pages/timetable/model/trainerSchedule.types.ts

/**
 * Тип элемента расписания тренера, соответствующий ответу бэкенда
 * TrainerScheduleItemResponse.
 *
 * Поля:
 * - sessionId: уникальный идентификатор тренировки
 * - title: название тренировки
 * - studentId: идентификатор ученика (может отсутствовать)
 * - studentName: имя ученика, если указано
 * - startsAt: дата и время начала тренировки (ISO‑8601 строка)
 * - endsAt: дата и время окончания тренировки, если есть (ISO‑8601 строка)
 * - location: место проведения, если указано
 * - status: статус участия ученика
 * - canConfirmCancellation: можно ли тренеру подтвердить запрос на отмену
 * - canMarkAttended: можно ли тренеру отметить посещение
 * - canMarkNoShow: можно ли тренеру отметить неявку
 * - canCancelByTrainer: можно ли тренеру отменить тренировку без списания лимита
 */
export type TrainerScheduleItem = {
    sessionId: string;
    title?: string | null;
    studentId?: string | null;
    studentName?: string | null;
    startsAt: string;
    endsAt?: string | null;
    location?: string | null;
    status?: string | null;
    canConfirmCancellation: boolean;
    canMarkAttended: boolean;
    canMarkNoShow: boolean;
    canCancelByTrainer: boolean;
};
