// frontend/src/pages/timetable/ui/pages/DayPage/DayPage.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MONTHS_SHORT, WEEK_DAYS } from "../../../model/timetable.constants";
import { dayPageStyles as s } from "../../../styles/dayPage.styles";
import { useIsCoach } from "../../../../members/model/useIsCoach";
import { fetchMySchedule } from "../../../../mySchedule/api/mySchedule.api";
import { fetchTrainerSchedule } from "../../../api/trainerSchedule.api";
import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import { CreateTrainingButton } from "../../components/CreateTrainingButton/CreateTrainingButton";
import { TrainingInfoModal } from "../../components/TrainingInfoModal/TrainingInfoModal";

type Props = {
    date?: string;
};

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

function toLocalIso(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Parse an ISO date string in YYYY-MM-DD format into a local Date at midnight.
 *
 * The calendar routes may include a full ISO-8601 timestamp with a time component
 * (for example, "2026-03-15T12:00:00+03:00"). Prior logic split the string on
 * hyphens and attempted to coerce the third segment to a number directly. When
 * a time component is present, the third segment ends up including the time
 * portion (e.g. "15T12:00:00+03:00"), which results in `Number(parts[2])`
 * returning `NaN`. Passing such a value to `new Date(year, month, NaN)`
 * produces an invalid date and downstream logic computed an incorrect week or
 * highlighted the wrong day. To robustly handle both formats, we split on
 * the `T` separator first (if present) and then parse the date portion.
 */
function parseIsoDateLocal(value: string): Date {
    if (!value) {
        return new Date();
    }

    // Extract only the date part (before any time component or timezone)
    const datePart = value.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
            return new Date(year, month - 1, day);
        }
    }

    // Fall back to native parsing for any unexpected format
    return new Date(value);
}

export function DayPage({ date }: Props) {
    const navigate = useNavigate();
    const isCoach = useIsCoach();

    const [schedule, setSchedule] = useState<Array<MyScheduleItem | TrainerScheduleItem>>([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [infoItem, setInfoItem] = useState<MyScheduleItem | TrainerScheduleItem | null>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = toLocalIso(today);

    const selectedDate = date ? parseIsoDateLocal(date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);
    const selectedIso = toLocalIso(selectedDate);

    const weekdayIndex = (selectedDate.getDay() + 6) % 7;
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() - weekdayIndex);

    const week = [] as {
        isoDate: string;
        day: number;
        weekDay: string;
        isToday: boolean;
        isSelected: boolean;
    }[];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0, 0, 0, 0);

        const iso = toLocalIso(d);

        week.push({
            isoDate: iso,
            day: d.getDate(),
            weekDay: WEEK_DAYS[i],
            isToday: iso === todayIso,
            isSelected: iso === selectedIso,
        });
    }

    const title =
        `${WEEK_DAYS[(selectedDate.getDay() + 6) % 7]} — ${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`;

    useEffect(() => {
        let active = true;

        async function load() {
            if (!selectedIso) {
                setSchedule([]);
                return;
            }

            setScheduleLoading(true);

            try {
                const from = `${selectedIso}T00:00:00`;
                const to = `${selectedIso}T23:59:59`;

                if (isCoach) {
                    const data = await fetchTrainerSchedule({ from, to });
                    if (active) {
                        setSchedule(data);
                    }
                } else {
                    const data = await fetchMySchedule({ from, to });
                    if (active) {
                        setSchedule(data);
                    }
                }
            } catch (_err) {
                if (active) {
                    setSchedule([]);
                }
            } finally {
                if (active) {
                    setScheduleLoading(false);
                }
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [isCoach, selectedIso]);

    return (
        <div style={s.root}>
            <div style={s.header}>
                <button type="button" style={s.back} onClick={() => navigate("/timetable")}>
                    ‹
                </button>
                <span>{title}</span>
            </div>

            <div style={s.weekRow}>
                {week.map((d) => {
                    const numberStyle = {
                        ...s.weekDayNumber,
                        ...(d.isToday ? s.weekDayNumberToday : {}),
                        ...(d.isSelected ? s.weekDayNumberSelected : {}),
                    };

                    return (
                        <div
                            key={d.isoDate}
                            style={s.weekDayColumn}
                            onClick={() => navigate(`/timetable/day/${d.isoDate}`)}
                        >
                            <div style={s.weekDayLabel}>{d.weekDay}</div>
                            <div style={numberStyle}>{d.day}</div>
                        </div>
                    );
                })}
            </div>

            <div style={s.scheduleWrap}>
                {scheduleLoading ? (
                    <div style={s.scheduleLoading}>Загрузка…</div>
                ) : schedule.length === 0 ? (
                    <div style={s.scheduleEmpty}>Нет тренировок</div>
                ) : (
                    schedule.map((item) => {
                        const time = item.startsAt.slice(11, 16);
                        const name = isCoach
                            ? (item as TrainerScheduleItem).studentName ?? ""
                            : ((item as MyScheduleItem).coachName ?? undefined);

                        const label = isCoach
                            ? name || "Тренировка"
                            : name
                                ? `Тренировка (${name})`
                                : (item as MyScheduleItem).title?.trim() || "Тренировка";

                        return (
                            <div
                                key={(item as { sessionId: string }).sessionId}
                                style={s.scheduleItem}
                                onClick={() => setInfoItem(item)}
                            >
                                <div style={s.scheduleItemTime}>{time}</div>
                                <div style={s.scheduleItemName}>{label}</div>
                            </div>
                        );
                    })
                )}
            </div>

            {hours.map((h) => (
                <div key={h} style={s.row}>
                    {h}
                </div>
            ))}

            <CreateTrainingButton date={selectedIso} />

            <TrainingInfoModal
                open={infoItem !== null}
                item={infoItem}
                isCoach={isCoach}
                onClose={() => setInfoItem(null)}
            />
        </div>
    );
}