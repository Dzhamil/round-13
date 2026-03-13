// frontend/src/pages/timetable/ui/pages/TimetablePage/TimetablePage.container.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMySchedule } from "../../../../mySchedule/api/mySchedule.api";
import { useIsCoach } from "../../../../members/model/useIsCoach";
import { getMe } from "../../../../../shared/api/account.api";
import { fetchTrainerSchedule } from "../../../api/trainerSchedule.api";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import { useMonth } from "../../../model/useMonth";
import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import { loadTrainingCancelRequests, type TrainingCancelRequest, updateTrainingCancelRequestStatus } from "../../../model/trainingCancelRequests";
import { startOfDayIso, toLocalIsoDate, todayIso } from "../../../model/timetableDate";
import { TimetablePage } from "./TimetablePage";

type TimetableTab = "TRAININGS" | "SECONDARY";

type DayMeta = {
    dot: boolean;
    labels: string[];
};

const SELECTED_DATE_STORAGE_KEY = "round13:timetable:selected-date";

function readSelectedDate(): string {
    if (typeof window === "undefined") {
        return todayIso();
    }

    const stored = window.sessionStorage.getItem(SELECTED_DATE_STORAGE_KEY);
    return stored || todayIso();
}

function writeSelectedDate(value: string) {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.setItem(SELECTED_DATE_STORAGE_KEY, value);
}

function dayLabelForAthlete(item: MyScheduleItem): string {
    if (item.coachName) {
        return `Тренировка (${item.coachName})`;
    }
    return item.title?.trim() || "Тренировка";
}

function dayLabelForCoach(item: TrainerScheduleItem): string {
    return item.studentName?.trim() || "Тренировка";
}

function dayIsoFromStartsAt(startsAt: string): string {
    const parsed = new Date(startsAt);
    if (Number.isNaN(parsed.getTime())) {
        return startsAt.slice(0, 10);
    }
    return toLocalIsoDate(parsed);
}

export function TimetablePageContainer() {
    const [selected, setSelected] = useState<string>(() => readSelectedDate());
    const { days, monthLabel, monthStartIso: visibleMonthStartIso, monthEndIso: visibleMonthEndIso, next, prev, jumpToMonth } = useMonth(selected);
    const [tab, setTab] = useState<TimetableTab>("TRAININGS");
    const [dayMetaByIso, setDayMetaByIso] = useState<Record<string, DayMeta>>({});
    const [loading, setLoading] = useState(false);
    const [meId, setMeId] = useState<string | null>(null);
    const [cancelRequests, setCancelRequests] = useState<TrainingCancelRequest[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const navigate = useNavigate();
    const isCoach = useIsCoach();

    useEffect(() => {
        let active = true;

        getMe()
            .then((me) => {
                if (!active) {
                    return;
                }
                setMeId(me.id);
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                setMeId(null);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        writeSelectedDate(selected);
    }, [selected]);

    useEffect(() => {
        setCancelRequests(loadTrainingCancelRequests());
    }, []);

    useEffect(() => {
        let active = true;

        async function loadMonthData() {
            setLoading(true);

            try {
                const from = startOfDayIso(visibleMonthStartIso);
                const to = startOfDayIso(visibleMonthEndIso);

                if (isCoach) {
                    const items = await fetchTrainerSchedule({ from, to });
                    if (!active) {
                        return;
                    }

                    const nextMeta: Record<string, DayMeta> = {};
                    for (const item of items) {
                        const dayIso = dayIsoFromStartsAt(item.startsAt);
                        const current = nextMeta[dayIso] ?? { dot: false, labels: [] };
                        current.dot = true;
                        const label = dayLabelForCoach(item);
                        if (label && !current.labels.includes(label)) {
                            current.labels.push(label);
                        }
                        nextMeta[dayIso] = current;
                    }

                    setDayMetaByIso(nextMeta);
                } else {
                    const items = await fetchMySchedule({ from, to });
                    if (!active) {
                        return;
                    }

                    const nextMeta: Record<string, DayMeta> = {};
                    for (const item of items) {
                        const dayIso = dayIsoFromStartsAt(item.startsAt);
                        const current = nextMeta[dayIso] ?? { dot: false, labels: [] };
                        current.dot = true;
                        const label = dayLabelForAthlete(item);
                        if (label && !current.labels.includes(label)) {
                            current.labels.push(label);
                        }
                        nextMeta[dayIso] = current;
                    }

                    setDayMetaByIso(nextMeta);
                }
            } catch (_error) {
                if (!active) {
                    return;
                }
                setDayMetaByIso({});
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadMonthData();

        return () => {
            active = false;
        };
    }, [isCoach, refreshKey, visibleMonthEndIso, visibleMonthStartIso]);

    const handleSelect = (iso: string) => {
        setSelected(iso);
        jumpToMonth(iso);
        navigate(`/timetable/day/${iso}`);
    };

    const handleTrainingCreated = () => {
        setRefreshKey((value) => value + 1);
    };

    const secondaryItems = useMemo(() => {
        if (!meId) {
            return [];
        }

        return cancelRequests.filter((item) =>
            isCoach ? item.coachId === meId : item.studentId === meId,
        );
    }, [cancelRequests, isCoach, meId]);

    const handleNotificationAction = (requestId: string, action: "ACCEPTED" | "DECLINED") => {
        setCancelRequests(updateTrainingCancelRequestStatus(requestId, action));
    };

    const secondaryTabLabel = useMemo(() => {
        return isCoach ? "Уведомления" : "Запросы";
    }, [isCoach]);

    return (
        <TimetablePage
            days={days}
            monthLabel={monthLabel}
            selected={selected}
            tab={tab}
            secondaryTabLabel={secondaryTabLabel}
            secondaryItems={secondaryItems}
            isCoach={isCoach}
            loading={loading}
            dayMetaByIso={dayMetaByIso}
            onSelect={handleSelect}
            onPrev={prev}
            onNext={next}
            onTabChange={setTab}
            onCreated={handleTrainingCreated}
            onNotificationAction={handleNotificationAction}
        />
    );
}
