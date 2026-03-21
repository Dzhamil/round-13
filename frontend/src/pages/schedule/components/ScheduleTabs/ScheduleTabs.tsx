import type { ScheduleTab } from "../../model/schedule.types";
import { schedulePageStyles as s } from "../../SchedulePage/schedulePage.styles";

type Props = {
    tab: ScheduleTab;
    onChange: (tab: ScheduleTab) => void;
};

export function ScheduleTabs({ tab, onChange }: Props) {
    return (
        <div style={s.tabsWrap}>
            <button
                type="button"
                style={s.tab(tab === "CLUB_EVENTS")}
                onClick={() => onChange("CLUB_EVENTS")}
            >
                События клуба
            </button>
            <button
                type="button"
                style={s.tab(tab === "MY_EVENTS")}
                onClick={() => onChange("MY_EVENTS")}
            >
                Мои события
            </button>
            <button
                type="button"
                style={s.tab(tab === "HISTORY")}
                onClick={() => onChange("HISTORY")}
            >
                История
            </button>
        </div>
    );
}
