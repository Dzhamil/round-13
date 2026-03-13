import { clubMembersPageStyles as membersStyles } from "../../../members/ui/pages/clubMembersPage.styles";
import type { ScheduleTab } from "../../model/schedule.types";

type Props = {
    tab: ScheduleTab;
    onChange: (tab: ScheduleTab) => void;
};

export function ScheduleTabs({ tab, onChange }: Props) {
    return (
        <div style={membersStyles.tabsWrap}>
            <button
                type="button"
                style={membersStyles.tab(tab === "CLUB_EVENTS")}
                onClick={() => onChange("CLUB_EVENTS")}
            >
                События клуба
            </button>
            <button
                type="button"
                style={membersStyles.tab(tab === "MY_EVENTS")}
                onClick={() => onChange("MY_EVENTS")}
            >
                Мои события
            </button>
        </div>
    );
}
