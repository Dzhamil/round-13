// frontend/src/pages/timetable/ui/components/MonthCalendar/MonthCalendar.tsx
import type { MonthDay } from "../../../model/useMonth";
import { WEEK_DAYS } from "../../../model/timetable.constants";
import { monthCalendarStyles as s } from "../../../styles/monthCalendar.styles";
import type { DayMetaLabel, TrainingStatusTone } from "../../../model/trainingStatusTone";

type DayMeta = {
    dot?: boolean;
    dotTone?: TrainingStatusTone;
    labels?: DayMetaLabel[];
};

type Props = {
    days: MonthDay[];
    selected: string | null;
    dayMetaByIso: Record<string, DayMeta>;
    onSelect: (isoDate: string) => void;
};

export function MonthCalendar({ days, selected, dayMetaByIso, onSelect }: Props) {
    return (
        <div>
            <div style={s.weekdaysRow}>
                {WEEK_DAYS.map((day) => (
                    <div key={day} style={s.weekdayCell}>
                        {day}
                    </div>
                ))}
            </div>

            <div style={s.grid}>
                {days.map((day, index) => {
                    const isSelected = selected === day.isoDate;
                    const meta = dayMetaByIso[day.isoDate] ?? {};
                    const labels = (meta.labels ?? []).slice(0, 2);

                    const stateStyle =
                        day.state === "prev"
                            ? s.prev
                            : day.state === "next"
                                ? s.next
                                : day.state === "today"
                                    ? s.today
                                    : s.current;

                    const numberStyle = {
                        ...s.dayNumber,
                        ...(day.state === "today" ? s.dayNumberToday : {}),
                        ...(isSelected ? s.dayNumberSelected : {}),
                    };

                    const labelStyle =
                        day.state === "prev" || day.state === "next"
                            ? s.subLabelMuted
                            : s.subLabel;

                    return (
                        <button
                            key={day.isoDate}
                            type="button"
                            style={{
                                ...s.cell,
                                ...(index < 7 ? s.firstRow : {}),
                                ...stateStyle,
                                ...(isSelected ? s.selected : {}),
                            }}
                            onClick={() => onSelect(day.isoDate)}
                        >
                            <div style={s.cellHeader}>
                                <span style={numberStyle}>{day.date}</span>
                                {meta.dot ? <span style={s.dot(meta.dotTone ?? "neutral")} /> : null}
                            </div>

                            <div style={s.labelsWrap}>
                                {labels.map((label, index) => (
                                    <span
                                        key={`${day.isoDate}-${index}`}
                                        style={{
                                            ...labelStyle,
                                            ...s.labelTone(label.tone),
                                        }}
                                    >
                                        {label.text}
                                    </span>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
