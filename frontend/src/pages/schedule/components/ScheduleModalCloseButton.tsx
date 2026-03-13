import { ScheduleActionButton } from "./ScheduleActionButton";

export function ScheduleModalCloseButton({
                                             onClick,
                                         }: {
    onClick: () => void;
}) {
    return (
        <ScheduleActionButton onClick={onClick} variant="ghost" fullWidth>
            Закрыть
        </ScheduleActionButton>
    );
}
