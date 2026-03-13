// frontend/src/pages/mySchedule/ui/components/MyScheduleItem/MyScheduleItem.tsx
import type { MyScheduleItem } from "../../../model/mySchedule.types";
import { myScheduleItemStyles as s } from "./MyScheduleItem.styles";

type Props = {
    item: MyScheduleItem;
    onRequestCancel?: (sessionId: string) => void;
    cancelling?: boolean;
};

function getStatusLabel(status?: string | null): string | null {
    if (!status) return null;
    if (status === "BOOKED") return "Записан";
    if (status === "CANCEL_REQUESTED") return "Запрос на отмену отправлен";
    if (status === "CANCELLED_FREE") return "Отменено без списания";
    if (status === "CANCELLED_LATE") return "Отменено со списанием";
    if (status === "CANCELLED_BY_TRAINER") return "Тренировка отменена тренером";
    if (status === "ATTENDED") return "Тренировка посещена";
    if (status === "NO_SHOW") return "Неявка";
    return status;
}

export function MyScheduleItem({ item, onRequestCancel, cancelling = false }: Props) {
    const statusLabel = getStatusLabel(item.status);

    return (
        <div style={s.card}>
            <div style={s.title}>{item.title ?? "Тренировка"}</div>

            <div style={s.meta}>{formatDateTime(item.startsAt)}</div>

            {item.coachName ? <div style={s.row}>Тренер: {item.coachName}</div> : null}
            {item.location ? <div style={s.row}>Место: {item.location}</div> : null}
            {statusLabel ? <div style={s.status}>Статус: {statusLabel}</div> : null}

            {item.canCancel && onRequestCancel ? (
                <div style={s.actions}>
                    <button
                        type="button"
                        style={s.cancelButton}
                        onClick={() => onRequestCancel(item.sessionId)}
                        disabled={cancelling}
                    >
                        {cancelling ? "Отправляем..." : "Запросить отмену"}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function formatDateTime(value: string): string {
    // Простой “тупой” форматтер без зависимостей.
    // Если понадобится единый формат по приложению — вынесем в shared/lib.
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}
