import { schedulePageStyles as s } from "../schedulePage.styles";
import { ScheduleActionButton } from "./ScheduleActionButton";

export function SchedulePageHeader({
                                       onReload,
                                       loading,
                                   }: {
    onReload: () => void;
    loading: boolean;
}) {
    return (
        <div style={s.header}>
            <div style={s.headerCopy}>
                <h2 style={s.headerTitle}>Афиша</h2>
                <p style={s.headerSubtitle}>
                    Ближайшие тренировки и открытые занятия в Telegram dark-стиле.
                </p>
            </div>
            <ScheduleActionButton onClick={onReload} disabled={loading} variant="secondary">
                Обновить
            </ScheduleActionButton>
        </div>
    );
}
