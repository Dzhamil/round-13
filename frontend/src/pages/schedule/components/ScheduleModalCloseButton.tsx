import { Button } from "../../../shared/ui/Button";

export function ScheduleModalCloseButton({
                                             onClick,
                                         }: {
    onClick: () => void;
}) {
    return (
        <Button onClick={onClick} variant="ghost" fullWidth>
            Закрыть
        </Button>
    );
}
