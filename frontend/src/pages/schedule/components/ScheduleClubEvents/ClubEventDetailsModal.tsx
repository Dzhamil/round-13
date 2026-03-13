import { formatEventDate, formatEventTime, getClubEventKindLabel } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";
import { getClubEventTrainerLabel } from "./scheduleClubEvents.helpers";
import { scheduleClubEventsStyles as s } from "./scheduleClubEvents.styles";

type Props = {
    item: ClubEventItem | null;
    open: boolean;
    canManage: boolean;
    joiningId: string | null;
    deletingId: string | null;
    onClose: () => void;
    onToggleParticipation: (event: ClubEventItem) => Promise<void>;
    onEditEvent: (event: ClubEventItem) => void;
    onEditTraining: (event: ClubEventItem) => void;
    onDelete: (event: ClubEventItem) => Promise<void>;
};

export function ClubEventDetailsModal(props: Props) {
    const {
        item,
        open,
        canManage,
        joiningId,
        deletingId,
        onClose,
        onToggleParticipation,
        onEditEvent,
        onEditTraining,
        onDelete,
    } = props;

    if (!open || !item) {
        return null;
    }

    const trainerLabel = getClubEventTrainerLabel(item);
    const groupPackageEmpty = item.requiresGroupPackage && !item.joinedByMe && (item.remainingGroupTrainings ?? 0) <= 0;

    return (
        <div style={s.detailsOverlay} onClick={onClose}>
            <div style={s.detailsModal} onClick={(event) => event.stopPropagation()}>
                <button type="button" style={s.detailsClose} onClick={onClose} aria-label="Закрыть">
                    ×
                </button>

                <div style={s.detailsType}>{getClubEventKindLabel(item.type)}</div>
                <h3 style={s.detailsTitle}>{item.title}</h3>

                <div style={s.detailsMetaList}>
                    <p style={s.detailsMetaRow}>
                        {formatEventDate(item.startsAt)} • {formatEventTime(item.startsAt, item.endsAt)}
                    </p>
                    {trainerLabel && item.type === "COACH_TRAINING" ? (
                        <p style={s.detailsMetaRow}>Тренер: {trainerLabel}</p>
                    ) : null}
                    {item.location ? <p style={s.detailsMetaRow}>Место: {item.location}</p> : null}
                    {item.description ? <p style={s.detailsMetaRow}>{item.description}</p> : null}
                    {item.requiresGroupPackage ? (
                        <p style={s.detailsMetaRow}>
                            Пакет групповых тренировок: осталось {item.remainingGroupTrainings ?? 0}
                        </p>
                    ) : null}
                </div>

                <div style={s.detailsActions}>
                    <button
                        type="button"
                        style={item.joinedByMe ? s.cancelButton : s.joinButton}
                        onClick={() => void onToggleParticipation(item)}
                        disabled={joiningId === item.id || groupPackageEmpty}
                    >
                        {joiningId === item.id
                            ? "Обновление..."
                            : item.joinedByMe
                                ? "Не участвую"
                                : item.requiresGroupPackage
                                    ? "Записаться"
                                    : "Участвовать"}
                    </button>

                    {canManage ? (
                        <button
                            type="button"
                            style={s.editButton}
                            onClick={() => {
                                onClose();
                                if (item.type === "COACH_TRAINING") {
                                    onEditTraining(item);
                                } else {
                                    onEditEvent(item);
                                }
                            }}
                        >
                            Редактировать
                        </button>
                    ) : null}

                    {canManage ? (
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
        </div>
    );
}
