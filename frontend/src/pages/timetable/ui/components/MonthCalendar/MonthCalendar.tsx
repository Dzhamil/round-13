// frontend/src/pages/timetable/ui/components/MonthCalendar/MonthCalendar.tsx
import type { MonthDay } from "../../../model/useMonth";
import { WEEK_DAYS } from "../../../model/timetable.constants";
import { monthCalendarStyles as s } from "../../../styles/monthCalendar.styles";
import type { DayMetaLabel, TrainingStatusTone } from "../../../model/trainingStatusTone";

type DayMeta = {
    dot?: boolean;
    dotTone?: TrainingStatusTone;
    labels?: DayMetaLabel[];
    count?: number;
};

type Props = {
    days: MonthDay[];
    selected: string | null;
    dayMetaByIso: Record<string, DayMeta>;
    onSelect: (isoDate: string) => void;
};

function getTrainingCountLabel(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
        return `${count} тренировка`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} тренировки`;
    }
    return `${count} тренировок`;
}

function getDayAriaLabel(day: MonthDay, meta: DayMeta, labels: DayMetaLabel[]): string {
    const count = meta.count ?? labels.length;
    if (count <= 0) {
        return `${day.isoDate}, тренировок нет. Открыть день.`;
    }

    const labelSummary = labels.map((label) => label.text).join(", ");
    return `${day.isoDate}, ${getTrainingCountLabel(count)}${labelSummary ? `: ${labelSummary}` : ""}. Открыть день.`;
}

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
                    const allLabels = meta.labels ?? [];
                    const labels = allLabels.slice(0, 1);
                    const visibleCount = labels.length;
                    const sessionCount = meta.count ?? allLabels.length;
                    const hiddenCount = Math.max(0, sessionCount - visibleCount);

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
                            aria-label={getDayAriaLabel(day, meta, allLabels)}
                            aria-current={isSelected ? "date" : undefined}
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
                                {hiddenCount > 0 ? (
                                    <span style={s.moreBadge}>+{hiddenCount}</span>
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
