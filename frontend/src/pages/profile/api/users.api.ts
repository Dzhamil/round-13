import { getUserProfile, type UserProfileResponse } from "../../../shared/api/users.api";

export type { UserProfileResponse };

export async function fetchUserProfile(userId: string): Promise<UserProfileResponse> {
    return getUserProfile(userId);
}
