import { ScheduleActionButton } from "./ScheduleActionButton";

export function ScheduleFiltersResetButton({
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
            Сбросить фильтры
        </ScheduleActionButton>
    );
}
