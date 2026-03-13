// frontend/src/pages/profile/api/profile.api.ts
import { http } from "../../../shared/api/http";
import type { MeResponse } from "../../../shared/api/account.api";

/**
 * Получить текущего пользователя.
 *
 * GET /api/account/me
 */
export async function fetchMe(): Promise<MeResponse> {
    const response = await http.get<MeResponse>("/account/me");
    return response.data;
}
