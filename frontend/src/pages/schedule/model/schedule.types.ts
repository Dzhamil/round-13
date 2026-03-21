export type RoleCode = "ADMIN" | "COACH" | "ATHLETE" | string;

export type ScheduleTab = "CLUB_EVENTS" | "MY_EVENTS" | "HISTORY";

export type MyEventItem = {
    id: string;
    title: string;
    startsAt: string;
    endsAt?: string | null;
    kind: "EVENT" | "TRAINING";
    kindLabel: string;
    location?: string | null;
};

export type ClubEventItem = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt?: string | null;
    location?: string | null;
    createdByUserId: string;
    createdByName?: string | null;
    trainerUserId?: string | null;
    trainerName?: string | null;
    joinedByMe?: boolean;
    requiresGroupPackage?: boolean;
    remainingGroupTrainings?: number | null;
};

export type EventTypeOption = {
    value: string;
    label: string;
};

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
    {
        value: "CLUB_EVENT",
        label: "Мероприятие клуба",
    },
    {
        value: "COMPETITION",
        label: "Соревнование",
    },
    {
        value: "TRAINING_CAMP",
        label: "Сборы / выезд",
    },
    {
        value: "OPEN_TRAINING",
        label: "Открытая тренировка",
    },
    {
        value: "ANNOUNCEMENT",
        label: "Объявление",
    },
];
