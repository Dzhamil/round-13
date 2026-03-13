// frontend/src/pages/members/api/members.api.ts
import type {
    MembersGroup,
    MembersListResponse,
    MemberDetails,
    TrainerStudentHistory,
    TrainerStudentNote,
    TrainingBalanceHistoryResponse,
} from "../model/members.types";
import { http } from "../../../shared/api/http";

/**
 * Получить список участников (бойцов или тренеров).
 *
 * Используем общий axios‑клиент `http`, который автоматически подставляет
 * базовый URL `/api` и заголовок Authorization. Параметр group передаётся
 * через query string.
 */
export async function getMembers(group: MembersGroup): Promise<MembersListResponse> {
    const res = await http.get<MembersListResponse>("/members", {
        params: { group },
    });
    return res.data;
}

/**
 * Получить список моих учеников.
 *
 * Для защищённого эндпоинта используем axios‑клиент `http`, чтобы
 * автоматически прокинуть токен. Возвращаем поле `data` из ответа.
 */
export async function getMyStudents(): Promise<MembersListResponse> {
    const res = await http.get<MembersListResponse>("/members/my-students");
    return res.data;
}

/**
 * Получить детальную карточку участника по его идентификатору.
 *
 * Также используем axios‑клиент `http`, чтобы подставить базовый URL и
 * заголовок авторизации. Возвращаем JSON‑объект со всеми полями.
 */
export async function getMemberDetails(memberId: string): Promise<MemberDetails> {
    const res = await http.get<MemberDetails>(`/members/${memberId}`);
    return res.data;
}

export async function addStudent(memberId: string): Promise<void> {
    // Используем общий клиент http, чтобы автоматически подставлялся заголовок Authorization
    await http.post(`/trainer/students/${memberId}`);
}

export async function removeStudent(memberId: string): Promise<void> {
    // Используем общий клиент http, чтобы автоматически подставлялся заголовок Authorization
    await http.delete(`/trainer/students/${memberId}`);
}

export async function updateStudentRemainingTrainings(memberId: string, remainingTrainings: number): Promise<void> {
    await http.patch(`/trainer/students/${memberId}/remaining-trainings`, {
        remainingTrainings,
    });
}

export async function updateStudentCoachNote(memberId: string, note: string): Promise<TrainerStudentNote> {
    const res = await http.patch<TrainerStudentNote>(`/trainer/students/${memberId}/coach-note`, {
        note,
    });
    return res.data;
}

export async function getTrainingBalanceHistory(): Promise<TrainingBalanceHistoryResponse> {
    const res = await http.get<TrainingBalanceHistoryResponse>("/trainer/students/history");
    return res.data;
}

export async function getStudentHistory(memberId: string): Promise<TrainerStudentHistory> {
    const res = await http.get<TrainerStudentHistory>(`/trainer/students/${memberId}/history`);
    return res.data;
}
