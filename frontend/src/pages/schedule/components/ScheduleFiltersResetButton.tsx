import { Button } from "../../../shared/ui/Button";

export function ScheduleFiltersResetButton({
                                               onClick,
                                               disabled,
                                           }: {
    onClick: () => void;
    disabled: boolean;
}) {
    return (
        <Button onClick={onClick} disabled={disabled} variant="secondary" fullWidth>
            Сбросить фильтры
        </Button>
    );
}
