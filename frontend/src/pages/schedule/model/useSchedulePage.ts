import { useEffect, useState } from "react";

import { getMe, type MeResponse } from "../../../shared/api/account.api";
import { fetchMySchedule } from "../../mySchedule/api/mySchedule.api";
import {
    cancelClubEvent,
    deleteClubEvent,
    deleteCoachTrainingEvent,
    fetchClubEvents,
    fetchClubEventsHistory,
    fetchMyClubEvents,
    joinClubEvent,
} from "../api/clubEvents.api";
import { fetchTrainerSchedule } from "../../timetable/api/trainerSchedule.api";
import type { TrainerScheduleItem } from "../../timetable/model/trainerSchedule.types";
import { isPastScheduleItem, mergeMyEvents, sortHistoryEvents, sortMyEvents } from "./schedule.lib";
import type { ClubEventItem, MyEventItem, RoleCode, ScheduleTab } from "./schedule.types";

type UseSchedulePageResult = {
    meId: string | null;
    tab: ScheduleTab;
    setTab: (tab: ScheduleTab) => void;
    eventModalOpen: boolean;
    trainingModalOpen: boolean;
    editingEvent: ClubEventItem | null;
    editingTraining: ClubEventItem | null;
    openEventModal: () => void;
    closeEventModal: () => void;
    openTrainingModal: () => void;
    closeTrainingModal: () => void;
    openEventEditor: (event: ClubEventItem) => void;
    openTrainingEditor: (event: ClubEventItem) => void;
    canAddEvent: boolean;
    canAddTraining: boolean;
    clubEventsLoading: boolean;
    clubEventsError: string | null;
    clubEvents: ClubEventItem[];
    clubEventsHistoryLoading: boolean;
    clubEventsHistoryError: string | null;
    clubEventsHistory: ClubEventItem[];
    deletingClubEventId: string | null;
    joiningClubEventId: string | null;
    myEventsLoading: boolean;
    myEventsError: string | null;
    myEvents: MyEventItem[];
    historyLoading: boolean;
    historyError: string | null;
    historyItems: MyEventItem[];
    reloadClubEvents: () => void;
    deleteClubEventById: (event: ClubEventItem) => Promise<void>;
    toggleClubEventParticipation: (event: ClubEventItem) => Promise<void>;
};

export function useSchedulePage(): UseSchedulePageResult {
    const [meId, setMeId] = useState<string | null>(null);
    const [role, setRole] = useState<RoleCode | null>(null);
    const [tab, setTab] = useState<ScheduleTab>("CLUB_EVENTS");
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [trainingModalOpen, setTrainingModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ClubEventItem | null>(null);
    const [editingTraining, setEditingTraining] = useState<ClubEventItem | null>(null);
    const [clubEventsLoading, setClubEventsLoading] = useState(false);
    const [clubEventsError, setClubEventsError] = useState<string | null>(null);
    const [clubEvents, setClubEvents] = useState<ClubEventItem[]>([]);
    const [clubEventsHistoryLoading, setClubEventsHistoryLoading] = useState(false);
    const [clubEventsHistoryError, setClubEventsHistoryError] = useState<string | null>(null);
    const [clubEventsHistory, setClubEventsHistory] = useState<ClubEventItem[]>([]);
    const [clubEventsRefreshKey, setClubEventsRefreshKey] = useState(0);
    const [deletingClubEventId, setDeletingClubEventId] = useState<string | null>(null);
    const [joiningClubEventId, setJoiningClubEventId] = useState<string | null>(null);
    const [myEventsLoading, setMyEventsLoading] = useState(false);
    const [myEventsError, setMyEventsError] = useState<string | null>(null);
    const [myEvents, setMyEvents] = useState<MyEventItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyItems, setHistoryItems] = useState<MyEventItem[]>([]);

    useEffect(() => {
        let alive = true;

        getMe()
            .then((me: MeResponse) => {
                if (!alive) {
                    return;
                }

                setMeId(me.id);
                setRole(me.role ?? null);
            })
            .catch(() => {
                if (!alive) {
                    return;
                }

                setMeId(null);
                setRole(null);
            });

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (tab !== "CLUB_EVENTS") {
            return;
        }

        let alive = true;

        setClubEventsLoading(true);
        setClubEventsError(null);

        fetchClubEvents()
            .then((items) => {
                if (!alive) {
                    return;
                }

                setClubEvents(items);
            })
            .catch((error: any) => {
                if (!alive) {
                    return;
                }

                setClubEvents([]);
                setClubEventsError(error?.response?.data?.message ?? "Не удалось загрузить события клуба");
            })
            .finally(() => {
                if (!alive) {
                    return;
                }

                setClubEventsLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [clubEventsRefreshKey, tab]);

    useEffect(() => {
        if (tab !== "HISTORY") {
            return;
        }

        let alive = true;

        setHistoryLoading(true);
        setHistoryError(null);

        Promise.all([
            fetchClubEventsHistory(),
            fetchMySchedule(),
            fetchMyClubEvents(),
            role === "COACH" || role === "ADMIN"
                ? fetchTrainerSchedule()
                : Promise.resolve<TrainerScheduleItem[]>([]),
        ])
            .then(([historyClubEvents, myScheduleItems, myClubEventItems, trainerScheduleItems]) => {
                if (!alive) {
                    return;
                }

                setClubEventsHistory(historyClubEvents);

                const pastScheduleItems = myScheduleItems.filter((item) =>
                    isPastScheduleItem({ startsAt: item.startsAt, endsAt: item.endsAt }),
                );
                const pastTrainerScheduleItems = trainerScheduleItems.filter((item) =>
                    isPastScheduleItem({ startsAt: item.startsAt, endsAt: item.endsAt }),
                );
                const pastMyClubEvents = myClubEventItems.filter((item) =>
                    isPastScheduleItem({ startsAt: item.startsAt, endsAt: item.endsAt }),
                );

                const merged = mergeMyEvents(
                    pastScheduleItems,
                    pastTrainerScheduleItems,
                    [...historyClubEvents, ...pastMyClubEvents],
                );

                setHistoryItems(sortHistoryEvents(merged));
            })
            .catch((error: any) => {
                if (!alive) {
                    return;
                }

                setClubEventsHistory([]);
                setHistoryItems([]);
                setHistoryError(error?.response?.data?.message ?? "Не удалось загрузить историю");
            })
            .finally(() => {
                if (!alive) {
                    return;
                }

                setHistoryLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [clubEventsRefreshKey, tab]);

    useEffect(() => {
        if (tab !== "MY_EVENTS") {
            return;
        }

        let alive = true;

        setMyEventsLoading(true);
        setMyEventsError(null);

        Promise.all([
            fetchMySchedule(),
            fetchMyClubEvents(),
            role === "COACH" || role === "ADMIN" ? fetchTrainerSchedule() : Promise.resolve<TrainerScheduleItem[]>([]),
        ])
            .then(([myScheduleItems, myClubEventItems, trainerScheduleItems]) => {
                if (!alive) {
                    return;
                }

                const merged = mergeMyEvents(myScheduleItems, trainerScheduleItems, myClubEventItems);
                setMyEvents(
                    sortMyEvents(
                        merged.filter((item) =>
                            !isPastScheduleItem({ startsAt: item.startsAt, endsAt: item.endsAt }),
                        ),
                    ),
                );
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
    }, [clubEventsRefreshKey, role, tab]);

    async function deleteClubEventById(event: ClubEventItem) {
        setDeletingClubEventId(event.id);

        try {
            if (role === "ADMIN") {
                await deleteClubEvent(event.id);
            } else {
                await deleteCoachTrainingEvent(event.id);
            }

            setClubEvents((current) => current.filter((item) => item.id !== event.id));
            setClubEventsRefreshKey((current) => current + 1);
        } catch (error: any) {
            setClubEventsError(error?.response?.data?.message ?? "Не удалось удалить событие");
        } finally {
            setDeletingClubEventId(null);
        }
    }

    async function toggleClubEventParticipation(event: ClubEventItem) {
        setJoiningClubEventId(event.id);

        try {
            if (event.joinedByMe) {
                await cancelClubEvent(event.id);
            } else {
                await joinClubEvent(event.id);
            }

            setClubEvents((current) =>
                current.map((item) =>
                    item.id === event.id
                        ? { ...item, joinedByMe: !item.joinedByMe }
                        : item
                )
            );

            setClubEventsRefreshKey((current) => current + 1);
        } catch (error: any) {
            setClubEventsError(error?.response?.data?.message ?? "Не удалось обновить участие");
        } finally {
            setJoiningClubEventId(null);
        }
    }

    return {
        meId,
        tab,
        setTab,
        eventModalOpen,
        trainingModalOpen,
        editingEvent,
        editingTraining,
        openEventModal: () => {
            setEditingEvent(null);
            setEventModalOpen(true);
        },
        closeEventModal: () => {
            setEventModalOpen(false);
            setEditingEvent(null);
        },
        openTrainingModal: () => {
            setEditingTraining(null);
            setTrainingModalOpen(true);
        },
        closeTrainingModal: () => {
            setTrainingModalOpen(false);
            setEditingTraining(null);
        },
        openEventEditor: (event) => {
            setEditingEvent(event);
            setEventModalOpen(true);
        },
        openTrainingEditor: (event) => {
            setEditingTraining(event);
            setTrainingModalOpen(true);
        },
        canAddEvent: role === "ADMIN",
        canAddTraining: role === "COACH" || role === "ADMIN",
        clubEventsLoading,
        clubEventsError,
        clubEvents,
        clubEventsHistoryLoading,
        clubEventsHistoryError,
        clubEventsHistory,
        deletingClubEventId,
        joiningClubEventId,
        myEventsLoading,
        myEventsError,
        myEvents,
        historyLoading,
        historyError,
        historyItems,
        reloadClubEvents: () => setClubEventsRefreshKey((current) => current + 1),
        deleteClubEventById,
        toggleClubEventParticipation,
    };
}
