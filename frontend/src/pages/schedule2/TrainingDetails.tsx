import { AttendanceDeliveryStatus } from "./AttendanceDeliveryStatus";
import type { Participant, TrainingDetail } from "./schedule2.api";
import styles from "./Schedule2Page.module.css";

type Props = {
    detail: TrainingDetail;
    draft: Participant[];
    saving: boolean;
    error: string | null;
    onBack: () => void;
    onToggle: (id: string) => void;
    onApply: () => void;
    onRetry: () => void;
};
const typeNames: Record<string, string> = { GROUP: "Групповая", PERSONAL: "Персональная", OPEN: "Открытая" };
const time = (value: string) => new Date(value).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

export function TrainingDetails({ detail, draft, saving, error, onBack, onToggle, onApply, onRetry }: Props) {
    const training = detail.training;
    const saved = new Map(detail.participants.map(participant => [participant.participationId, participant]));
    const dirty = draft.some(participant => participant.attendanceStatus !== saved.get(participant.participationId)?.attendanceStatus);
    const canConfirm = dirty || training.attendanceSheetSyncStatus === "NEW";

    return <section className={styles.page}>
        <button className={styles.back} disabled={saving} onClick={onBack}>← К расписанию</button>
        <div className={styles.meta}>
            <h1>{training.title}</h1>
            <p>{new Date(training.startTime).toLocaleDateString("ru")} · {time(training.startTime)}–{time(training.endTime)}</p>
            <p>{typeNames[training.type] ?? training.type} · {training.location || "Место не указано"} · {training.trainerName}</p>
            <p>{training.participantsCount} участников</p>
        </div>
        <AttendanceDeliveryStatus status={training.attendanceSheetSyncStatus}/>
        {training.attendanceSheetSyncStatus === "NOT_SYNCED" &&
            <button className={styles.retry} disabled={saving} onClick={onRetry}>
                {saving ? "Отправка…" : "Отправить повторно"}
            </button>}
        <h2>Посещаемость</h2>
        <div className={styles.students}>
            {draft.map(participant => <button key={participant.participationId}
                disabled={saving} aria-pressed={participant.attendanceStatus === "PRESENT"}
                className={participant.attendanceStatus === "PRESENT" ? styles.present : ""}
                onClick={() => onToggle(participant.participationId)}>
                <span>{participant.studentName}</span>
                <b>{participant.attendanceStatus === "PRESENT" ? "✓ Был" : "Не был"}</b>
            </button>)}
        </div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.apply} disabled={!canConfirm || saving} onClick={onApply}>
            {saving ? "Сохранение…" : "Подтвердить посещаемость"}
        </button>
    </section>;
}
