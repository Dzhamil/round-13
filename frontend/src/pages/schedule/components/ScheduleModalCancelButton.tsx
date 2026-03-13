import { Button } from "../../../shared/ui/Button";

export function ScheduleModalCancelButton({
                                              onClick,
                                              disabled,
                                          }: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="secondary"
            fullWidth
        >
            Отменить запись
        </Button>
    );
}
