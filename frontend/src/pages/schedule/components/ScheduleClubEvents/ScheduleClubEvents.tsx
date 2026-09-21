import { useState } from "react";
import { formatEventDate, formatEventTime, getClubEventKindLabel } from "../../model/schedule.lib";
import type { ClubEventItem } from "../../model/schedule.types";
import { ClubEventDetailsModal } from "./ClubEventDetailsModal";
import {
    getClubEventDescriptionPreview,
    getClubEventLocationLabel,
    getClubEventOwnerLabel,
    getClubEventSummary,
} from "./scheduleClubEvents.helpers";
import { scheduleClubEventsStyles as s } from "./scheduleClubEvents.styles";

type Props = {
    mode?: "UPCOMING" | "HISTORY";
    canAddEvent: boolean;
    loading: boolean;
    error: string | null;
    items: ClubEventItem[];
    deletingId: string | null;
    joiningId: string | null;
    canDeleteAny: boolean;
    onAddEvent: () => void;
    onDelete: (event: ClubEventItem) => Promise<void>;
    onEditEvent: (event: ClubEventItem) => void;
    onToggleParticipation: (event: ClubEventItem) => Promise<void>;
};

export function ScheduleClubEvents({
    mode = "UPCOMING",
    canAddEvent,
    loading,
    error,
    items,
    deletingId,
    joiningId,
    canDeleteAny,
    onAddEvent,
    onDelete,
    onEditEvent,
    onToggleParticipation,
}: Props) {
    const [selectedItem, setSelectedItem] = useState<ClubEventItem | null>(null);
    const isHistoryMode = mode === "HISTORY";

    return (
        <>
            {!isHistoryMode && canAddEvent ? (
                <div style={s.actionsTop}>
                    {canAddEvent ? (
                        <button type="button" style={s.primaryActionButton} onClick={onAddEvent}>
                            Добавить событие
                        </button>
                    ) : null}
                </div>
            ) : null}

            {loading ? <p style={s.text}>Загрузка событий…</p> : null}
            {error ? <p style={s.text}>{error}</p> : null}
            {!loading && !error && items.length === 0 ? (
                <p style={s.text}>{isHistoryMode ? "История пока пуста." : "Пока событий нет."}</p>
            ) : null}

            {!loading && !error && items.length > 0 ? (
                <div style={s.list}>
                    {items.map((item) => {
                        const eventKindLabel = getClubEventKindLabel(item.type);
                        const locationLabel = getClubEventLocationLabel(item);
                        const ownerLabel = getClubEventOwnerLabel(item);
                        const descriptionPreview = getClubEventDescriptionPreview(item);
                        const summary = getClubEventSummary(item);
                        const showOwner = !!ownerLabel;

                        return (
                            <div key={item.id} style={s.eventRow}>
                                <button
                                    type="button"
                                    style={s.eventRowButton}
                                    onClick={() => setSelectedItem(item)}
                                    title={summary}
                                    aria-label={summary}
                                >
                                    <span style={s.eventRowTop}>
                                        <span style={s.eventHeader}>
                                            {eventKindLabel}
                                        </span>
                                        <span style={s.eventRowDateTime}>
                                            {formatEventDate(item.startsAt)} • {formatEventTime(item.startsAt, item.endsAt)}
                                        </span>
                                    </span>

                                    <span style={s.eventRowTitle}>{item.title}</span>

                                    {locationLabel || showOwner ? (
                                        <span style={s.eventRowMetaStack}>
                                            {locationLabel ? (
                                                <span style={s.eventRowMeta}>Место: {locationLabel}</span>
                                            ) : null}
                                            {showOwner ? (
                                                <span style={s.eventRowMeta}>Организатор: {ownerLabel}</span>
                                            ) : null}
                                        </span>
                                    ) : null}

                                    {descriptionPreview ? (
                                        <span style={s.eventRowDescription}>{descriptionPreview}</span>
                                    ) : null}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <ClubEventDetailsModal
                item={selectedItem}
                open={selectedItem !== null}
                showActions={!isHistoryMode}
                canManage={
                    !!selectedItem && canDeleteAny
                }
                joiningId={joiningId}
                deletingId={deletingId}
                onClose={() => setSelectedItem(null)}
                onToggleParticipation={onToggleParticipation}
                onEditEvent={onEditEvent}
                onDelete={onDelete}
            />
        </>
    );
}
