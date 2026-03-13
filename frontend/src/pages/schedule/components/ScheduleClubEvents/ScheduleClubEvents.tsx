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
    currentUserId: string | null;
    deletingId: string | null;
    joiningId: string | null;
    canDeleteAny: boolean;
    onAddEvent: () => void;
    onAddTraining: () => void;
    onDelete: (event: ClubEventItem) => Promise<void>;
    onToggleParticipation: (event: ClubEventItem) => Promise<void>;
};

export function ScheduleClubEvents({
    canAddEvent,
    canAddTraining,
    loading,
    error,
    items,
    currentUserId,
    deletingId,
    joiningId,
    canDeleteAny,
    onAddEvent,
    onAddTraining,
    onDelete,
    onToggleParticipation,
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
                            <div style={s.topRow}>
                                <div style={item.type === "COACH_TRAINING" ? s.trainingHeader : s.eventHeader}>
                                    {item.type === "COACH_TRAINING" ? "Тренировка" : "Событие"}
                                </div>
                                <p style={s.eventDate}>{formatEventDate(item.startsAt)}</p>
                            </div>
                            <p style={s.eventTitle}>{item.title}</p>
                            <p style={s.eventMeta}>{formatEventTime(item.startsAt, item.endsAt)}</p>
                            {item.description ? <p style={s.eventMeta}>{item.description}</p> : null}
                            {item.location ? <p style={s.eventMeta}>Место: {item.location}</p> : null}
                            <div style={s.actionsRow}>
                                <button
                                    type="button"
                                    style={item.joinedByMe ? s.cancelButton : s.joinButton}
                                    onClick={() => void onToggleParticipation(item)}
                                    disabled={joiningId === item.id}
                                >
                                    {joiningId === item.id
                                        ? "Обновление..."
                                        : item.joinedByMe
                                            ? "Не участвую"
                                            : "Участвовать"}
                                </button>
                            {(canDeleteAny || (item.type === "COACH_TRAINING" && currentUserId === item.createdByUserId)) ? (
                                <button
                                    type="button"
                                    style={s.deleteButton}
                                    onClick={() => void onDelete(item)}
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? "Удаление..." : "Удалить"}
                                </button>
                            ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </>
    );
}
