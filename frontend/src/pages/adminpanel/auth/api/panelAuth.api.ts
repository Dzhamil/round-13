import { panelHttp } from "../../../../shared/api/panelHttp";

export type PanelLoginRequest = { login: string; password: string };
export type PanelMeResponse = { id: string; login: string };

export async function panelLogin(req: PanelLoginRequest): Promise<void> {
    // формируем тело как URL‑encoded, иначе formLogin не поймёт
    const body = new URLSearchParams();
    body.set("login", req.login);
    body.set("password", req.password);
    await panelHttp.post("/panel/auth/login", body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
}

export async function fetchPanelMe(): Promise<PanelMeResponse> {
    const res = await panelHttp.get<PanelMeResponse>("/panel/auth/me");
    return res.data;
}
