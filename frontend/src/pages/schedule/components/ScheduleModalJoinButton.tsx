import { ScheduleActionButton } from "./ScheduleActionButton";

export function ScheduleModalJoinButton({
                                            onClick,
                                            disabled,
                                        }: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <ScheduleActionButton onClick={onClick} disabled={disabled} fullWidth>
            Записаться
        </ScheduleActionButton>
    );
}
