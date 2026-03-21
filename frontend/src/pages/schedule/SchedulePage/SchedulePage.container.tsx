import { useSchedulePage } from "../model/useSchedulePage";
import { SchedulePage } from "./SchedulePage";

export function SchedulePageContainer() {
    const state = useSchedulePage();

    return (
        <SchedulePage
            meId={state.meId}
            tab={state.tab}
            onTabChange={state.setTab}
            eventModalOpen={state.eventModalOpen}
            trainingModalOpen={state.trainingModalOpen}
            editingEvent={state.editingEvent}
            editingTraining={state.editingTraining}
            onEventModalOpen={state.openEventModal}
            onEventModalClose={state.closeEventModal}
            onEventSaved={state.reloadClubEvents}
            onTrainingModalOpen={state.openTrainingModal}
            onTrainingModalClose={state.closeTrainingModal}
            onTrainingSaved={state.reloadClubEvents}
            onClubEventEdit={state.openEventEditor}
            onClubTrainingEdit={state.openTrainingEditor}
            canAddEvent={state.canAddEvent}
            canAddTraining={state.canAddTraining}
            clubEventsLoading={state.clubEventsLoading}
            clubEventsError={state.clubEventsError}
            clubEvents={state.clubEvents}
            clubEventsHistoryLoading={state.clubEventsHistoryLoading}
            clubEventsHistoryError={state.clubEventsHistoryError}
            clubEventsHistory={state.clubEventsHistory}
            deletingClubEventId={state.deletingClubEventId}
            joiningClubEventId={state.joiningClubEventId}
            myEventsLoading={state.myEventsLoading}
            myEventsError={state.myEventsError}
            myEvents={state.myEvents}
            historyLoading={state.historyLoading}
            historyError={state.historyError}
            historyItems={state.historyItems}
            onClubEventDelete={state.deleteClubEventById}
            onClubEventToggleParticipation={state.toggleClubEventParticipation}
        />
    );
}
