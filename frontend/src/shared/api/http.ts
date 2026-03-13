import axios from "axios";
import { getAccessToken } from "../lib/tokens";

/**
 * Прод/dev:
 * - В dev используем относительный /api (vite proxy).
 * - В prod можно переопределить через VITE_API_BASE_URL.
 */
const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
    ? "/api"
    : (import.meta.env.VITE_API_BASE_URL?.trim() || "/api");

export const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Interceptor: подставляем Authorization: Bearer <token>
 */
http.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
