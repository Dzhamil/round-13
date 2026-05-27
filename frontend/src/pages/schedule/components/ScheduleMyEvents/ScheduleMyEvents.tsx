import { formatEventDate, formatEventTime } from "../../model/schedule.lib";
import type { MyEventItem } from "../../model/schedule.types";
import { scheduleMyEventsStyles as s } from "./scheduleMyEvents.styles";

type Props = {
    loading: boolean;
    error: string | null;
    items: MyEventItem[];
};

export function ScheduleMyEvents({ loading, error, items }: Props) {
    if (loading) {
        return <p style={s.text}>Загрузка событий…</p>;
    }

    if (error) {
        return <p style={s.text}>{error}</p>;
    }

    if (items.length === 0) {
        return <p style={s.text}>Пока у вас нет событий.</p>;
    }

    return (
        <div style={s.list}>
            {items.map((item) => (
                <div key={item.id} style={s.eventItem}>
                    <div style={s.topRow}>
                        <div style={s.labelGroup}>
                            <p style={item.kind === "TRAINING" ? s.trainingLabel : s.eventLabel}>{item.kindLabel}</p>
                            {item.statusLabel ? <p style={s.statusBadge}>{item.statusLabel}</p> : null}
                        </div>
                        <p style={s.eventDate}>{formatEventDate(item.startsAt)}</p>
                    </div>
                    <p style={s.eventTitle}>{item.title}</p>
                    <p style={s.eventMeta}>{formatEventTime(item.startsAt, item.endsAt)}</p>
                    {item.personLabel ? <p style={s.eventMeta}>{item.personLabel}</p> : null}
                    {item.location ? <p style={s.eventMeta}>Место: {item.location}</p> : null}
                </div>
            ))}
        </div>
    );
}
