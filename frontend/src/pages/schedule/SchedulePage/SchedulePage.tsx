import { AddEventModal } from "../components/AddEventModal";
import { AddTrainingModal } from "../components/AddTrainingModal";
import { ScheduleClubEvents } from "../components/ScheduleClubEvents";
import { ScheduleMyEvents } from "../components/ScheduleMyEvents";
import { ScheduleTabs } from "../components/ScheduleTabs";
import type { ClubEventItem, MyEventItem, ScheduleTab } from "../model/schedule.types";
import { schedulePageStyles as s } from "./schedulePage.styles";

type Props = {
    meId: string | null;
    tab: ScheduleTab;
    onTabChange: (tab: ScheduleTab) => void;
    eventModalOpen: boolean;
    trainingModalOpen: boolean;
    editingEvent: ClubEventItem | null;
    editingTraining: ClubEventItem | null;
    onEventModalOpen: () => void;
    onEventModalClose: () => void;
    onEventSaved: () => void;
    onTrainingModalOpen: () => void;
    onTrainingModalClose: () => void;
    onTrainingSaved: () => void;
    onClubEventEdit: (event: ClubEventItem) => void;
    onClubTrainingEdit: (event: ClubEventItem) => void;
    canAddEvent: boolean;
    canAddTraining: boolean;
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
    meId,
    tab,
    onTabChange,
    eventModalOpen,
    trainingModalOpen,
    editingEvent,
    editingTraining,
    onEventModalOpen,
    onEventModalClose,
    onEventSaved,
    onTrainingModalOpen,
    onTrainingModalClose,
    onTrainingSaved,
    onClubEventEdit,
    onClubTrainingEdit,
    canAddEvent,
    canAddTraining,
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
                        canAddTraining={canAddTraining}
                        loading={clubEventsLoading}
                        error={clubEventsError}
                        items={clubEvents}
                        currentUserId={meId}
                        deletingId={deletingClubEventId}
                        joiningId={joiningClubEventId}
                        canDeleteAny={canAddEvent}
                        onAddEvent={onEventModalOpen}
                        onAddTraining={onTrainingModalOpen}
                        onDelete={onClubEventDelete}
                        onEditEvent={onClubEventEdit}
                        onEditTraining={onClubTrainingEdit}
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
            <AddTrainingModal
                open={trainingModalOpen}
                initialItem={editingTraining}
                onClose={onTrainingModalClose}
                onSaved={onTrainingSaved}
            />
        </div>
    );
}
