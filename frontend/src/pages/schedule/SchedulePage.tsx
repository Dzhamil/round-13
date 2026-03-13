import { SchedulePageShell } from "./components";
import { schedulePageStyles as s } from "./schedulePage.styles";

export function SchedulePage() {
    return (
        <SchedulePageShell>
            <div style={s.empty}>Тут афиша</div>
        </SchedulePageShell>
    );
}
