import { AddEventModal } from "../components/AddEventModal";
import { ScheduleClubEvents } from "../components/ScheduleClubEvents";
import { ScheduleMyEvents } from "../components/ScheduleMyEvents";
import { ScheduleTabs } from "../components/ScheduleTabs";
import type { ClubEventItem, MyEventItem, ScheduleTab } from "../model/schedule.types";
import { schedulePageStyles as s } from "./schedulePage.styles";

type Props = {
    tab: ScheduleTab;
    onTabChange: (tab: ScheduleTab) => void;
    eventModalOpen: boolean;
    editingEvent: ClubEventItem | null;
    onEventModalOpen: () => void;
    onEventModalClose: () => void;
    onEventSaved: () => void;
    onClubEventEdit: (event: ClubEventItem) => void;
    canAddEvent: boolean;
    clubEventsLoading: boolean;
    clubEventsError: string | null;
    clubEvents: ClubEventItem[];
    clubEventsHistoryLoading: boolean;
    clubEventsHistoryError: string | null;
    clubEventsHistory: ClubEventItem[];
    deletingClubEventId: string | null;
    joiningClubEventId: string | null;
    myEventsLoading: boolean;
    myEventsError: string | null;
    myEvents: MyEventItem[];
    historyLoading: boolean;
    historyError: string | null;
    historyItems: MyEventItem[];
    onClubEventDelete: (event: ClubEventItem) => Promise<void>;
    onClubEventToggleParticipation: (event: ClubEventItem) => Promise<void>;
};

export function SchedulePage({
    tab,
    onTabChange,
    eventModalOpen,
    editingEvent,
    onEventModalOpen,
    onEventModalClose,
    onEventSaved,
    onClubEventEdit,
    canAddEvent,
    clubEventsLoading,
    clubEventsError,
    clubEvents,
    clubEventsHistoryLoading,
    clubEventsHistoryError,
    clubEventsHistory,
    deletingClubEventId,
    joiningClubEventId,
    myEventsLoading,
    myEventsError,
    myEvents,
    historyLoading,
    historyError,
    historyItems,
    onClubEventDelete,
    onClubEventToggleParticipation,
}: Props) {
    return (
        <div style={s.root}>
            <ScheduleTabs tab={tab} onChange={onTabChange} />

            <div style={s.card}>
                <h2 style={s.title}>
                    {tab === "CLUB_EVENTS"
                        ? "События клуба"
                        : tab === "HISTORY"
                            ? "История"
                            : "Мои события"}
                </h2>

                {tab === "CLUB_EVENTS" ? (
                    <ScheduleClubEvents
                        mode="UPCOMING"
                        canAddEvent={canAddEvent}
                        loading={clubEventsLoading}
                        error={clubEventsError}
                        items={clubEvents}
                        deletingId={deletingClubEventId}
                        joiningId={joiningClubEventId}
                        canDeleteAny={canAddEvent}
                        onAddEvent={onEventModalOpen}
                        onDelete={onClubEventDelete}
                        onEditEvent={onClubEventEdit}
                        onToggleParticipation={onClubEventToggleParticipation}
                    />
                ) : null}

                {tab === "HISTORY" ? (
                    <ScheduleMyEvents
                        loading={historyLoading}
                        error={historyError}
                        items={historyItems}
                    />
                ) : null}

                {tab === "MY_EVENTS" ? (
                    <ScheduleMyEvents
                        loading={myEventsLoading}
                        error={myEventsError}
                        items={myEvents}
                    />
                ) : null}
            </div>

            <AddEventModal
                open={eventModalOpen}
                initialItem={editingEvent}
                onClose={onEventModalClose}
                onSaved={onEventSaved}
            />
        </div>
    );
}
