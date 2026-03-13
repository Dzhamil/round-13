import { Button } from "../../../shared/ui/Button";

export function ScheduleModalJoinButton({
                                            onClick,
                                            disabled,
                                        }: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <Button onClick={onClick} disabled={disabled} fullWidth>
            Записаться
        </Button>
    );
}
