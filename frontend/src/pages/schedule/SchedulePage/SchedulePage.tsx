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
    onEventModalOpen: () => void;
    onEventModalClose: () => void;
    onEventSaved: () => void;
    onTrainingModalOpen: () => void;
    onTrainingModalClose: () => void;
    onTrainingSaved: () => void;
    canAddEvent: boolean;
    canAddTraining: boolean;
    clubEventsLoading: boolean;
    clubEventsError: string | null;
    clubEvents: ClubEventItem[];
    deletingClubEventId: string | null;
    myEventsLoading: boolean;
    myEventsError: string | null;
    myEvents: MyEventItem[];
    onClubEventDelete: (event: ClubEventItem) => Promise<void>;
};

export function SchedulePage({
    meId,
    tab,
    onTabChange,
    eventModalOpen,
    trainingModalOpen,
    onEventModalOpen,
    onEventModalClose,
    onEventSaved,
    onTrainingModalOpen,
    onTrainingModalClose,
    onTrainingSaved,
    canAddEvent,
    canAddTraining,
    clubEventsLoading,
    clubEventsError,
    clubEvents,
    deletingClubEventId,
    myEventsLoading,
    myEventsError,
    myEvents,
    onClubEventDelete,
}: Props) {
    return (
        <div style={s.root}>
            <ScheduleTabs tab={tab} onChange={onTabChange} />

            <div style={s.card}>
                <h2 style={s.title}>{tab === "CLUB_EVENTS" ? "События клуба" : "Мои события"}</h2>

                {tab === "CLUB_EVENTS" ? (
                    <ScheduleClubEvents
                        canAddEvent={canAddEvent}
                        canAddTraining={canAddTraining}
                        loading={clubEventsLoading}
                        error={clubEventsError}
                        items={clubEvents}
                        currentUserId={meId}
                        deletingId={deletingClubEventId}
                        canDeleteAny={canAddEvent}
                        onAddEvent={onEventModalOpen}
                        onAddTraining={onTrainingModalOpen}
                        onDelete={onClubEventDelete}
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

            <AddEventModal open={eventModalOpen} onClose={onEventModalClose} onSaved={onEventSaved} />
            <AddTrainingModal open={trainingModalOpen} onClose={onTrainingModalClose} onSaved={onTrainingSaved} />
        </div>
    );
}
