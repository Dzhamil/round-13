import { Button } from "../../../shared/ui/Button";
import { schedulePageStyles as s } from "../schedulePage.styles";

export function SchedulePageHeader({
                                       onReload,
                                       loading,
                                   }: {
    onReload: () => void;
    loading: boolean;
}) {
    return (
        <div style={s.header}>
            <h2 style={{ margin: 0 }}>Расписание</h2>
            <Button onClick={onReload} disabled={loading}>
                Обновить
            </Button>
        </div>
    );
}
