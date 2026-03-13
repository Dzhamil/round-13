import { useState } from "react";
import { formatEventDate, formatEventTime } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";
import { ClubEventDetailsModal } from "./ClubEventDetailsModal";
import { getClubEventSummary, getClubEventTrainerLabel } from "./scheduleClubEvents.helpers";
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
    onEditEvent: (event: ClubEventItem) => void;
    onEditTraining: (event: ClubEventItem) => void;
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
    onEditEvent,
    onEditTraining,
    onToggleParticipation,
}: Props) {
    const [selectedItem, setSelectedItem] = useState<ClubEventItem | null>(null);

    return (
        <>
            {canAddEvent || canAddTraining ? (
                <div style={s.actionsTop}>
                    {canAddEvent ? (
                        <button type="button" style={s.primaryActionButton} onClick={onAddEvent}>
                            Добавить событие
                        </button>
                    ) : null}
                    {canAddTraining ? (
                        <button type="button" style={s.primaryActionButton} onClick={onAddTraining}>
                            Добавить тренировку
                        </button>
                    ) : null}
                </div>
            ) : null}

            {loading ? <p style={s.text}>Загрузка событий…</p> : null}
            {error ? <p style={s.text}>{error}</p> : null}
            {!loading && !error && items.length === 0 ? <p style={s.text}>Пока событий нет.</p> : null}

            {!loading && !error && items.length > 0 ? (
                <div style={s.list}>
                    {items.map((item) => {
                        const canManage =
                            canDeleteAny ||
                            (item.type === "COACH_TRAINING" && currentUserId === item.createdByUserId);
                        const groupPackageEmpty = item.requiresGroupPackage && !item.joinedByMe && (item.remainingGroupTrainings ?? 0) <= 0;
                        const trainerLabel = getClubEventTrainerLabel(item);

                        return (
                            <div key={item.id} style={s.eventRow}>
                                <button
                                    type="button"
                                    style={s.eventRowButton}
                                    onClick={() => setSelectedItem(item)}
                                    title={getClubEventSummary(item)}
                                >
                                    <span style={item.type === "COACH_TRAINING" ? s.trainingHeader : s.eventHeader}>
                                        {item.type === "COACH_TRAINING" ? "Тренировка" : "Событие"}
                                    </span>
                                    <span style={s.eventRowTitle}>{item.title}</span>
                                    <span style={s.eventRowMeta}>
                                        {formatEventDate(item.startsAt)} • {formatEventTime(item.startsAt, item.endsAt)}
                                    </span>
                                    {item.type === "COACH_TRAINING" && trainerLabel ? (
                                        <span style={s.eventRowMeta}>• Тренер: {trainerLabel}</span>
                                    ) : null}
                                </button>

                                <div style={s.rowActions}>
                                    <button
                                        type="button"
                                        style={item.joinedByMe ? s.cancelButtonCompact : s.joinButtonCompact}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void onToggleParticipation(item);
                                        }}
                                        disabled={joiningId === item.id || groupPackageEmpty}
                                    >
                                        {joiningId === item.id
                                            ? "..."
                                            : item.joinedByMe
                                                ? "Выйти"
                                                : item.requiresGroupPackage
                                                    ? "Запись"
                                                    : "Иду"}
                                    </button>
                                    {canManage ? (
                                        <button
                                            type="button"
                                            style={s.editButtonCompact}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (item.type === "COACH_TRAINING") {
                                                    onEditTraining(item);
                                                } else {
                                                    onEditEvent(item);
                                                }
                                            }}
                                        >
                                            Изм.
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <ClubEventDetailsModal
                item={selectedItem}
                open={selectedItem !== null}
                canManage={
                    !!selectedItem && (
                        canDeleteAny ||
                        (selectedItem.type === "COACH_TRAINING" && currentUserId === selectedItem.createdByUserId)
                    )
                }
                joiningId={joiningId}
                deletingId={deletingId}
                onClose={() => setSelectedItem(null)}
                onToggleParticipation={onToggleParticipation}
                onEditEvent={onEditEvent}
                onEditTraining={onEditTraining}
                onDelete={onDelete}
            />
        </>
    );
}
