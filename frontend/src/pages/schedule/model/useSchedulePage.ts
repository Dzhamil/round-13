import { useEffect, useState } from "react";

import { getMe, type MeResponse } from "../../../shared/api/account.api";
import { fetchMySchedule } from "../../mySchedule/api/mySchedule.api";
import { fetchTrainerSchedule } from "../../timetable/api/trainerSchedule.api";
import type { TrainerScheduleItem } from "../../timetable/model/trainerSchedule.types";
import { mergeMyEvents, sortMyEvents } from "./schedule.lib";
import type { MyEventItem, RoleCode, ScheduleTab } from "./schedule.types";

type UseSchedulePageResult = {
    tab: ScheduleTab;
    setTab: (tab: ScheduleTab) => void;
    eventModalOpen: boolean;
    trainingModalOpen: boolean;
    openEventModal: () => void;
    closeEventModal: () => void;
    openTrainingModal: () => void;
    closeTrainingModal: () => void;
    canAddEvent: boolean;
    canAddTraining: boolean;
    myEventsLoading: boolean;
    myEventsError: string | null;
    myEvents: MyEventItem[];
};

export function useSchedulePage(): UseSchedulePageResult {
    const [role, setRole] = useState<RoleCode | null>(null);
    const [tab, setTab] = useState<ScheduleTab>("CLUB_EVENTS");
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [trainingModalOpen, setTrainingModalOpen] = useState(false);
    const [myEventsLoading, setMyEventsLoading] = useState(false);
    const [myEventsError, setMyEventsError] = useState<string | null>(null);
    const [myEvents, setMyEvents] = useState<MyEventItem[]>([]);

    useEffect(() => {
        let alive = true;

        getMe()
            .then((me: MeResponse) => {
                if (!alive) {
                    return;
                }

                setRole(me.role ?? null);
            })
            .catch(() => {
                if (!alive) {
                    return;
                }

                setRole(null);
            });

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (tab !== "MY_EVENTS") {
            return;
        }

        let alive = true;

        setMyEventsLoading(true);
        setMyEventsError(null);

        Promise.all([
            fetchMySchedule(),
            role === "COACH" || role === "ADMIN" ? fetchTrainerSchedule() : Promise.resolve<TrainerScheduleItem[]>([]),
        ])
            .then(([myScheduleItems, trainerScheduleItems]) => {
                if (!alive) {
                    return;
                }

                const merged = mergeMyEvents(myScheduleItems, trainerScheduleItems);
                setMyEvents(sortMyEvents(merged));
            })
            .catch((error: any) => {
                if (!alive) {
                    return;
                }

                setMyEvents([]);
                setMyEventsError(error?.response?.data?.message ?? "Не удалось загрузить мои события");
            })
            .finally(() => {
                if (!alive) {
                    return;
                }

                setMyEventsLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [role, tab]);

    return {
        tab,
        setTab,
        eventModalOpen,
        trainingModalOpen,
        openEventModal: () => setEventModalOpen(true),
        closeEventModal: () => setEventModalOpen(false),
        openTrainingModal: () => setTrainingModalOpen(true),
        closeTrainingModal: () => setTrainingModalOpen(false),
        canAddEvent: role === "ADMIN",
        canAddTraining: role === "COACH" || role === "ADMIN",
        myEventsLoading,
        myEventsError,
        myEvents,
    };
}
