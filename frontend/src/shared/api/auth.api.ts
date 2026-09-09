import { http } from "./http";
import type { AuthTokens } from "../lib/tokens";

export type AuthTokensResponse = AuthTokens;

export type LoginRequest = {
    phone: string;
    password: string;
};

/** Browser login accepts a phone number and password. */
export function login(request: LoginRequest): Promise<AuthTokensResponse> {
    return http.post<AuthTokensResponse>("/auth/login", request).then((response) => response.data);
}
