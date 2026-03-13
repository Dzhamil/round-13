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
import { getMe } from "../../../../../shared/api/account.api";
import { addDays, parseIsoDateLocal, startOfDayIso, toLocalIsoDate } from "../../../model/timetableDate";
import { saveTrainingCancelRequest } from "../../../model/trainingCancelRequests";

type Props = {
    date?: string;
};

const SELECTED_DATE_STORAGE_KEY = "round13:timetable:selected-date";
const HOUR_ROW_HEIGHT = 48;
const PIXELS_PER_MINUTE = HOUR_ROW_HEIGHT / 60;
const VISIBLE_START_HOUR = 6;
const VISIBLE_END_HOUR = 24;
const hours = Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, index) => {
    const hour = VISIBLE_START_HOUR + index;
    return `${String(hour % 24).padStart(2, "0")}:00`;
});

function getSlotLabel(item: MyScheduleItem | TrainerScheduleItem, isCoach: boolean): string {
    if (isCoach) {
        return (item as TrainerScheduleItem).studentName?.trim() || "Тренировка";
    }

    const athleteItem = item as MyScheduleItem;
    return athleteItem.coachName?.trim() || athleteItem.title?.trim() || "Тренировка";
}

function getVisibleSlotStyle(item: MyScheduleItem | TrainerScheduleItem): { top: number; height: number } | null {
    const startHour = Number(item.startsAt.slice(11, 13));
    const startMinute = Number(item.startsAt.slice(14, 16));
    const startTotalMinutes = (Number.isNaN(startHour) ? 0 : startHour) * 60 + (Number.isNaN(startMinute) ? 0 : startMinute);

    let endTotalMinutes = startTotalMinutes + 60;
    if (item.endsAt) {
        const endHour = Number(item.endsAt.slice(11, 13));
        const endMinute = Number(item.endsAt.slice(14, 16));
        const parsedEndMinutes = (Number.isNaN(endHour) ? 0 : endHour) * 60 + (Number.isNaN(endMinute) ? 0 : endMinute);
        endTotalMinutes = Math.max(startTotalMinutes + 30, parsedEndMinutes);
    }

    const visibleStartMinutes = VISIBLE_START_HOUR * 60;
    const visibleEndMinutes = VISIBLE_END_HOUR * 60;

    if (endTotalMinutes <= visibleStartMinutes || startTotalMinutes >= visibleEndMinutes) {
        return null;
    }

    const clippedStartMinutes = Math.max(startTotalMinutes, visibleStartMinutes);
    const clippedEndMinutes = Math.min(endTotalMinutes, visibleEndMinutes);

    return {
        top: (clippedStartMinutes - visibleStartMinutes) * PIXELS_PER_MINUTE,
        height: Math.max(34, (clippedEndMinutes - clippedStartMinutes) * PIXELS_PER_MINUTE),
    };
}

export function DayPage({ date }: Props) {
    const navigate = useNavigate();
    const isCoach = useIsCoach();

    const [schedule, setSchedule] = useState<Array<MyScheduleItem | TrainerScheduleItem>>([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [infoItem, setInfoItem] = useState<MyScheduleItem | TrainerScheduleItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [me, setMe] = useState<{ id: string; nickname: string | null } | null>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = toLocalIsoDate(today);

    const selectedDate = parseIsoDateLocal(date);
    selectedDate.setHours(0, 0, 0, 0);
    const selectedIso = toLocalIsoDate(selectedDate);

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
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        const iso = toLocalIsoDate(currentDate);

        week.push({
            isoDate: iso,
            day: currentDate.getDate(),
            weekDay: WEEK_DAYS[i],
            isToday: iso === todayIso,
            isSelected: iso === selectedIso,
        });
    }

    const title = `${WEEK_DAYS[(selectedDate.getDay() + 6) % 7]} — ${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]}`;

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.sessionStorage.setItem(SELECTED_DATE_STORAGE_KEY, selectedIso);
    }, [selectedIso]);

    useEffect(() => {
        let active = true;

        getMe()
            .then((current) => {
                if (!active) {
                    return;
                }

                setMe({
                    id: current.id,
                    nickname: current.nickname ?? null,
                });
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                setMe(null);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function load() {
            setScheduleLoading(true);

            try {
                const from = startOfDayIso(selectedIso);
                const to = startOfDayIso(addDays(selectedIso, 1));

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
            } catch {
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
    }, [isCoach, refreshKey, selectedIso]);

    const handleRequestCancel = (item: MyScheduleItem) => {
        if (!me?.id || !item.coachId) {
            return;
        }

        saveTrainingCancelRequest({
            id: `${item.sessionId}:${me.id}`,
            sessionId: item.sessionId,
            studentId: me.id,
            studentName: me.nickname?.trim() || "Ученик",
            coachId: item.coachId,
            coachName: item.coachName?.trim() || "Тренер",
            startsAt: item.startsAt,
            createdAt: new Date().toISOString(),
            status: "PENDING",
        });
    };

    return (
        <div style={s.root}>
            <div style={s.topBar}>
                <div style={s.header}>
                    <button type="button" style={s.back} onClick={() => navigate("/timetable")}>
                        ‹
                    </button>
                    <span>{title}</span>
                </div>

                <div style={s.weekRow}>
                    {week.map((item, index) => {
                        const columnStyle = {
                            ...s.weekDayColumn,
                            ...(index > 0 ? s.weekDayColumnWithDivider : {}),
                            ...(item.isSelected ? s.weekDayColumnSelected : {}),
                        };

                        const labelStyle = {
                            ...s.weekDayLabel,
                            ...(item.isToday ? s.weekDayLabelToday : {}),
                            ...(item.isSelected ? s.weekDayLabelSelected : {}),
                        };

                        const numberStyle = {
                            ...s.weekDayNumber,
                            ...(item.isToday ? s.weekDayNumberToday : {}),
                            ...(item.isSelected ? s.weekDayNumberSelected : {}),
                        };

                        return (
                            <button
                                key={item.isoDate}
                                type="button"
                                style={columnStyle}
                                onClick={() => navigate(`/timetable/day/${item.isoDate}`)}
                            >
                                <div style={labelStyle}>{item.weekDay}</div>
                                <div style={numberStyle}>{item.day}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={s.scheduleWrap}>
                {scheduleLoading ? <div style={s.scheduleLoading}>Загрузка…</div> : null}
                {!scheduleLoading && schedule.length === 0 ? <div style={s.scheduleEmpty}>Нет тренировок</div> : null}

                <div
                    style={{
                        ...s.scheduleGrid,
                        minHeight: `${hours.length * HOUR_ROW_HEIGHT}px`,
                    }}
                >
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            style={{
                                ...s.row,
                                height: `${HOUR_ROW_HEIGHT}px`,
                            }}
                        >
                            <div style={s.rowTime}>{hour}</div>
                        </div>
                    ))}

                    {!scheduleLoading
                        ? schedule.map((item) => {
                            const slotStyle = getVisibleSlotStyle(item);
                            if (!slotStyle) {
                                return null;
                            }

                            const label = getSlotLabel(item, isCoach);

                            return (
                                <button
                                    key={(item as { sessionId: string }).sessionId}
                                    type="button"
                                    aria-label={`${item.startsAt.slice(11, 16)} ${label}`}
                                    style={{
                                        ...s.scheduleItem,
                                        top: `${slotStyle.top}px`,
                                        minHeight: `${slotStyle.height}px`,
                                    }}
                                    onClick={() => setInfoItem(item)}
                                >
                                    <div style={s.scheduleItemName}>{label}</div>
                                </button>
                            );
                        })
                        : null}
                </div>
            </div>

            <CreateTrainingButton
                date={selectedIso}
                onCreated={() => setRefreshKey((value) => value + 1)}
            />

            <TrainingInfoModal
                open={infoItem !== null}
                item={infoItem}
                isCoach={isCoach}
                onClose={() => setInfoItem(null)}
                onRequestCancel={handleRequestCancel}
            />
        </div>
    );
}
