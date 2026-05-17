import axios from "axios";
import { getPanelAccessToken } from "../lib/panelTokens";

const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
    ? "/api"
    : (import.meta.env.VITE_API_BASE_URL?.trim() || "/api");

export const panelHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

panelHttp.interceptors.request.use((config) => {
    const token = getPanelAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
