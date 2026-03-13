import { Button } from "../../../../shared/ui/Button";
import { scheduleClubEventsStyles as s } from "./scheduleClubEvents.styles";

type Props = {
    canAddEvent: boolean;
    canAddTraining: boolean;
    onAddEvent: () => void;
    onAddTraining: () => void;
};

export function ScheduleClubEvents({ canAddEvent, canAddTraining, onAddEvent, onAddTraining }: Props) {
    return (
        <>
            <p style={s.text}>
                Раздел переписываем с нуля. Пока оставляем только точки входа для публикации.
            </p>

            {canAddEvent ? <Button onClick={onAddEvent}>Добавить событие</Button> : null}
            {canAddTraining ? <Button onClick={onAddTraining}>Добавить тренировку</Button> : null}
        </>
    );
}
