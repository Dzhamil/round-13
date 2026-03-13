import { ScheduleActionButton } from "./ScheduleActionButton";

export function ScheduleModalCancelButton({
                                              onClick,
                                              disabled,
                                          }: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <ScheduleActionButton
            onClick={onClick}
            disabled={disabled}
            variant="secondary"
            fullWidth
        >
            Отменить запись
        </ScheduleActionButton>
    );
}
