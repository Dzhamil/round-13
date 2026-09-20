import { useState } from "react";
import { isAxiosError } from "axios";
import { panelHttp } from "../../../shared/api/panelHttp";

type Result = { spreadsheetId: string; sourceUsers: number; syncedAt: string };

export function AllUsersSheetSync({ available }: { available: boolean }) {
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState("");
    async function sync() {
        setPending(true);
        setResult(null);
        setError("");
        try {
            const response = await panelHttp.post<Result>("/panel/google-sheet-spaces/active/sync-users",
                undefined, { timeout: 180_000 });
            setResult(response.data);
        } catch (cause) {
            const message = isAxiosError(cause) ? cause.response?.data?.message : null;
            setError(typeof message === "string" ? message : "Не удалось выгрузить пользователей. Проверьте доступ и повторите попытку.");
        } finally { setPending(false); }
    }
    return <section aria-label="Все пользователи">
        <h2>Все пользователи</h2>
        <p>Полный снимок списка пользователей админки в активной таблице.
            Содержимое вкладки заменяется; исчезнувшие из админки пользователи удаляются из выгрузки.</p>
        <button type="button" disabled={!available || pending} onClick={() => void sync()}>
            {pending ? "Выгрузка пользователей…" : "Синхронизировать всех пользователей"}
        </button>
        {result && <p role="status">Все пользователи синхронизированы: {result.sourceUsers}. {" "}
            <a href={`https://docs.google.com/spreadsheets/d/${encodeURIComponent(result.spreadsheetId)}/edit`}
                target="_blank" rel="noreferrer">Открыть вкладку пользователей</a></p>}
        {error && <p role="alert">{error}</p>}
    </section>;
}
