import { useState } from "react";
import { isAxiosError } from "axios";
import { panelHttp } from "../../../shared/api/panelHttp";

type SyncResult = {
    spreadsheetId: string;
    activeTrainers: number;
    inactiveRows: number;
    addedRows: number;
    unmatchedRows: number;
    duplicateRows: number;
};

export function TrainerSheetSync({ available }: { available: boolean }) {
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState<SyncResult | null>(null);
    const [participantCount, setParticipantCount] = useState<number | null>(null);
    const [error, setError] = useState("");

    async function sync() {
        setPending(true);
        setError("");
        setResult(null);
        setParticipantCount(null);
        try {
            const response = await panelHttp.post<SyncResult>("/panel/google-sheet-spaces/active/sync-trainers", undefined, { timeout: 180_000 });
            setResult(response.data);
            const participants = await panelHttp.post<{ activeParticipants: number }>(
                "/panel/google-sheet-spaces/active/sync-participants", undefined, { timeout: 180_000 });
            setParticipantCount(participants.data.activeParticipants);
        } catch (cause) {
            const message = isAxiosError(cause) ? cause.response?.data?.message : null;
            setError(typeof message === "string" ? message : "Не удалось синхронизировать таблицу. Проверьте настройки и доступ, затем повторите попытку.");
        } finally {
            setPending(false);
        }
    }

    return <section aria-label="Синхронизация тренеров">
        <h2>Тренеры · Расписание 2.0</h2>
        <p>Вкладки «Тренеры» и «Участники» активной таблицы обновляются из базы приложения.
            Назначение и снятие тренерства в админке отражаются после нажатия кнопки.</p>
        <button type="button" disabled={!available || pending} onClick={() => void sync()}
            style={{ padding: "10px 14px", borderRadius: 9, cursor: "pointer" }}>
            {pending ? "Синхронизация…" : "Синхронизировать таблицу"}
        </button>
        {!available && <p>Настройте и активируйте Google Sheet-пространство.</p>}
        {result && <p role="status">Тренеры синхронизированы. Активных тренеров: {result.activeTrainers}.
            Добавлено строк: {result.addedRows}. Неактивных строк сохранено: {result.inactiveRows}.
            Без пользователя БД: {result.unmatchedRows}. Дубли помечены неактивными: {result.duplicateRows}.
            {" "}<a href={`https://docs.google.com/spreadsheets/d/${encodeURIComponent(result.spreadsheetId)}/edit`}
                target="_blank" rel="noreferrer">Открыть таблицу</a></p>}
        {participantCount !== null && <p role="status">Участники синхронизированы: {participantCount}.</p>}
        {error && <p role="alert">{error}</p>}
    </section>;
}
