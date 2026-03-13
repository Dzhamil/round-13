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
import { TimetablePage } from "./TimetablePage";

type TimetableTab = "TRAININGS" | "SECONDARY";

type DayMeta = {
    dot: boolean;
    labels: string[];
};

function startOfDayIso(value: string): string {
    return `${value}T00:00:00`;
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

export function TimetablePageContainer() {
    const { days, monthLabel, monthStartIso, monthEndIso, next, prev } = useMonth();
    const [selected, setSelected] = useState<string | null>(null);
    const [tab, setTab] = useState<TimetableTab>("TRAININGS");
    const [dayMetaByIso, setDayMetaByIso] = useState<Record<string, DayMeta>>({});
    const [loading, setLoading] = useState(false);
    const [nickname, setNickname] = useState<string | null>(null);

    const navigate = useNavigate();
    const isCoach = useIsCoach();

    useEffect(() => {
        let active = true;

        getMe()
            .then((me) => {
                if (!active) {
                    return;
                }
                setNickname(me.nickname ?? null);
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                setNickname(null);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadMonthData() {
            setLoading(true);

            try {
                const from = startOfDayIso(monthStartIso);
                const to = startOfDayIso(monthEndIso);

                if (isCoach) {
                    const items = await fetchTrainerSchedule({ from, to });
                    if (!active) {
                        return;
                    }

                    const nextMeta: Record<string, DayMeta> = {};
                    for (const item of items) {
                        const dayIso = item.startsAt.slice(0, 10);
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
                        const dayIso = item.startsAt.slice(0, 10);
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
    }, [isCoach, monthEndIso, monthStartIso]);

    const handleSelect = (iso: string) => {
        setSelected(iso);
        navigate(`/timetable/day/${iso}`);
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
            isCoach={isCoach}
            loading={loading}
            nickname={nickname}
            dayMetaByIso={dayMetaByIso}
            onSelect={handleSelect}
            onPrev={prev}
            onNext={next}
            onTabChange={setTab}
        />
    );
}