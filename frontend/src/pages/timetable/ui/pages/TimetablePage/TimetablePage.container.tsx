// frontend/src/pages/timetable/ui/pages/TimetablePage/TimetablePage.container.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMySchedule, requestMyScheduleCancellation } from "../../../../mySchedule/api/mySchedule.api";
import { useIsCoach } from "../../../../members/model/useIsCoach";
import { getMe } from "../../../../../shared/api/account.api";
import { confirmTrainerCancellation, fetchTrainerSchedule } from "../../../api/trainerSchedule.api";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import { useMonth } from "../../../model/useMonth";
import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import { startOfDayIso, toLocalIsoDate, todayIso } from "../../../model/timetableDate";
import { getTrainingStatusTone, pickDominantTone, type DayMetaLabel, type TrainingStatusTone } from "../../../model/trainingStatusTone";
import { getTrainingPrimaryLabel } from "../../../model/timetableTrainingDisplay";
import { TimetablePage } from "./TimetablePage";

type TimetableTab = "TRAININGS" | "SECONDARY";

type DayMeta = {
    dot: boolean;
    dotTone: TrainingStatusTone;
    labels: DayMetaLabel[];
    count: number;
};

type SecondaryItem = {
    id: string;
    sessionId: string;
    personName: string;
    startsAt: string;
    status: string;
    canConfirm: boolean;
};

const SELECTED_DATE_STORAGE_KEY = "round13:timetable:selected-date";
const SECONDARY_SEEN_STORAGE_KEY_PREFIX = "round13:timetable:secondary-seen";

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

function secondarySeenStorageKey(isCoach: boolean, meId: string | null): string {
    return `${SECONDARY_SEEN_STORAGE_KEY_PREFIX}:${isCoach ? "coach" : "athlete"}:${meId ?? "anonymous"}`;
}

function readSeenSecondaryFingerprint(key: string): string {
    if (typeof window === "undefined") {
        return "";
    }
    return window.sessionStorage.getItem(key) ?? "";
}

function writeSeenSecondaryFingerprint(key: string, value: string) {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.setItem(key, value);
}

function appendDayLabel(current: DayMeta, text: string, tone: TrainingStatusTone): DayMeta {
    current.count += 1;
    if (text && !current.labels.some((label) => label.text === text)) {
        current.labels.push({ text, tone });
    }
    current.dot = true;
    current.dotTone = pickDominantTone(current.dotTone, tone);
    return current;
}

function emptyDayMeta(): DayMeta {
    return { dot: false, dotTone: "neutral", labels: [], count: 0 };
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
    const [refreshKey, setRefreshKey] = useState(0);
    const [myScheduleItems, setMyScheduleItems] = useState<MyScheduleItem[]>([]);
    const [trainerScheduleItems, setTrainerScheduleItems] = useState<TrainerScheduleItem[]>([]);
    const [secondaryLoadingId, setSecondaryLoadingId] = useState<string | null>(null);
    const [seenSecondaryFingerprint, setSeenSecondaryFingerprint] = useState("");

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
                    setTrainerScheduleItems(items);
                    setMyScheduleItems([]);

                    const nextMeta: Record<string, DayMeta> = {};
                    for (const item of items) {
                        const dayIso = dayIsoFromStartsAt(item.startsAt);
                        const current = nextMeta[dayIso] ?? emptyDayMeta();
                        const label = getTrainingPrimaryLabel(item, true);
                        nextMeta[dayIso] = appendDayLabel(current, label, getTrainingStatusTone(item.status));
                    }

                    setDayMetaByIso(nextMeta);
                } else {
                    const items = await fetchMySchedule({ from, to });
                    if (!active) {
                        return;
                    }
                    setMyScheduleItems(items);
                    setTrainerScheduleItems([]);

                    const nextMeta: Record<string, DayMeta> = {};
                    for (const item of items) {
                        const dayIso = dayIsoFromStartsAt(item.startsAt);
                        const current = nextMeta[dayIso] ?? emptyDayMeta();
                        const label = getTrainingPrimaryLabel(item, false);
                        nextMeta[dayIso] = appendDayLabel(current, label, getTrainingStatusTone(item.status));
                    }

                    setDayMetaByIso(nextMeta);
                }
            } catch (_error) {
                if (!active) {
                    return;
                }
                setDayMetaByIso({});
                setMyScheduleItems([]);
                setTrainerScheduleItems([]);
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

    const secondaryItems = useMemo<SecondaryItem[]>(() => {
        if (isCoach) {
            return trainerScheduleItems
                .filter((item) => item.status && item.status !== "BOOKED")
                .map((item) => ({
                    id: item.sessionId,
                    sessionId: item.sessionId,
                    personName: item.studentName?.trim() || "Ученик",
                    startsAt: item.startsAt,
                    status: item.status ?? "BOOKED",
                    canConfirm: item.canConfirmCancellation,
                }));
        }

        return myScheduleItems
            .filter((item) => item.status && item.status !== "BOOKED")
            .map((item) => ({
                id: item.sessionId,
                sessionId: item.sessionId,
                personName: item.coachName?.trim() || "Тренер",
                startsAt: item.startsAt,
                status: item.status ?? "BOOKED",
                canConfirm: false,
                }));
    }, [isCoach, myScheduleItems, trainerScheduleItems]);

    const secondaryFingerprint = useMemo(() => {
        return secondaryItems
            .map((item) => `${item.id}:${item.status}:${item.canConfirm ? "1" : "0"}`)
            .sort()
            .join("|");
    }, [secondaryItems]);

    const secondarySeenKey = useMemo(() => {
        return secondarySeenStorageKey(isCoach, meId);
    }, [isCoach, meId]);

    useEffect(() => {
        setSeenSecondaryFingerprint(readSeenSecondaryFingerprint(secondarySeenKey));
    }, [secondarySeenKey]);

    useEffect(() => {
        if (tab !== "SECONDARY") {
            return;
        }

        writeSeenSecondaryFingerprint(secondarySeenKey, secondaryFingerprint);
        setSeenSecondaryFingerprint(secondaryFingerprint);
    }, [secondaryFingerprint, secondarySeenKey, tab]);

    const secondaryHasUnread = useMemo(() => {
        if (!secondaryFingerprint) {
            return false;
        }
        if (tab === "SECONDARY") {
            return false;
        }
        return secondaryFingerprint !== seenSecondaryFingerprint;
    }, [secondaryFingerprint, seenSecondaryFingerprint, tab]);

    const handleNotificationAction = async (sessionId: string) => {
        setSecondaryLoadingId(sessionId);

        try {
            if (isCoach) {
                await confirmTrainerCancellation(sessionId);
            } else {
                await requestMyScheduleCancellation(sessionId);
            }
            setRefreshKey((value) => value + 1);
        } finally {
            setSecondaryLoadingId(null);
        }
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
            secondaryHasUnread={secondaryHasUnread}
            secondaryItems={secondaryItems}
            isCoach={isCoach}
            loading={loading}
            secondaryLoadingId={secondaryLoadingId}
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
