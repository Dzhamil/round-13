export type RoleCode = "ADMIN" | "COACH" | "ATHLETE" | string;

export type ScheduleTab = "CLUB_EVENTS" | "MY_EVENTS";

export type MyEventItem = {
    id: string;
    title: string;
    startsAt: string;
    endsAt?: string | null;
};

export type ClubEventItem = {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startsAt: string;
    endsAt?: string | null;
    location?: string | null;
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
