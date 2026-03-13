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
            onEventModalOpen={state.openEventModal}
            onEventModalClose={state.closeEventModal}
            onEventSaved={state.reloadClubEvents}
            onTrainingModalOpen={state.openTrainingModal}
            onTrainingModalClose={state.closeTrainingModal}
            onTrainingSaved={state.reloadClubEvents}
            canAddEvent={state.canAddEvent}
            canAddTraining={state.canAddTraining}
            clubEventsLoading={state.clubEventsLoading}
            clubEventsError={state.clubEventsError}
            clubEvents={state.clubEvents}
            deletingClubEventId={state.deletingClubEventId}
            myEventsLoading={state.myEventsLoading}
            myEventsError={state.myEventsError}
            myEvents={state.myEvents}
            onClubEventDelete={state.deleteClubEventById}
        />
    );
}
