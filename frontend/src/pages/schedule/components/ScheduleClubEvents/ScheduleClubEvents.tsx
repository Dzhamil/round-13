import { Button } from "../../../../shared/ui/Button";
import { formatEventDate, formatEventTime } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";
import { scheduleClubEventsStyles as s } from "./scheduleClubEvents.styles";

type Props = {
    canAddEvent: boolean;
    canAddTraining: boolean;
    loading: boolean;
    error: string | null;
    items: ClubEventItem[];
    onAddEvent: () => void;
    onAddTraining: () => void;
};

export function ScheduleClubEvents({
    canAddEvent,
    canAddTraining,
    loading,
    error,
    items,
    onAddEvent,
    onAddTraining,
}: Props) {
    return (
        <>
            <p style={s.text}>
                Раздел переписываем с нуля. Пока оставляем только точки входа для публикации.
            </p>

            {canAddEvent ? <Button onClick={onAddEvent}>Добавить событие</Button> : null}
            {canAddTraining ? <Button onClick={onAddTraining}>Добавить тренировку</Button> : null}

            {loading ? <p style={s.text}>Загрузка событий…</p> : null}
            {error ? <p style={s.text}>{error}</p> : null}
            {!loading && !error && items.length === 0 ? <p style={s.text}>Пока событий нет.</p> : null}

            {!loading && !error && items.length > 0 ? (
                <div style={s.list}>
                    {items.map((item) => (
                        <div key={item.id} style={s.eventItem}>
                            <p style={s.eventDate}>{formatEventDate(item.startsAt)}</p>
                            <p style={s.eventTitle}>{item.title}</p>
                            <p style={s.eventMeta}>{formatEventTime(item.startsAt, item.endsAt)}</p>
                            {item.location ? <p style={s.eventMeta}>Место: {item.location}</p> : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </>
    );
}
