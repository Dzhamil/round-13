import { useSchedulePage } from "../model/useSchedulePage";
import { SchedulePage } from "./SchedulePage";

export function SchedulePageContainer() {
    const state = useSchedulePage();

    return (
        <SchedulePage
            tab={state.tab}
            onTabChange={state.setTab}
            eventModalOpen={state.eventModalOpen}
            trainingModalOpen={state.trainingModalOpen}
            onEventModalOpen={state.openEventModal}
            onEventModalClose={state.closeEventModal}
            onTrainingModalOpen={state.openTrainingModal}
            onTrainingModalClose={state.closeTrainingModal}
            canAddEvent={state.canAddEvent}
            canAddTraining={state.canAddTraining}
            myEventsLoading={state.myEventsLoading}
            myEventsError={state.myEventsError}
            myEvents={state.myEvents}
        />
    );
}
