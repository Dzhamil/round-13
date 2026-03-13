// frontend/src/pages/mySchedule/ui/components/MyScheduleItem/MyScheduleItem.tsx
import type { MyScheduleItem } from "../../../model/mySchedule.types";
import { myScheduleItemStyles as s } from "./MyScheduleItem.styles";

type Props = {
    item: MyScheduleItem;
};

export function MyScheduleItem({ item }: Props) {
    return (
        <div style={s.card}>
            <div style={s.title}>{item.title ?? "Тренировка"}</div>

            <div style={s.meta}>{formatDateTime(item.startsAt)}</div>

            {item.coachName ? <div style={s.row}>Тренер: {item.coachName}</div> : null}
            {item.location ? <div style={s.row}>Место: {item.location}</div> : null}
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
