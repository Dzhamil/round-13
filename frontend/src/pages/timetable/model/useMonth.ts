// frontend/src/pages/timetable/model/useMonth.ts
import { useEffect, useMemo, useState } from "react";
import { MONTHS_SHORT } from "./timetable.constants";
import { monthStartIso as toMonthStartIso, nextMonthStartIso, parseIsoDateLocal, toLocalIsoDate } from "./timetableDate";

export type MonthDayState = "prev" | "current" | "next" | "today";

export type MonthDay = {
    date: number;
    month: number;
    year: number;
    isoDate: string;
    state: MonthDayState;
};

export function useMonth(initialDateIso?: string) {
    const normalizedInitialIso = toMonthStartIso(initialDateIso ?? toLocalIsoDate(new Date()));
    const [cursorIso, setCursorIso] = useState(() => normalizedInitialIso);

    const { days, monthLabel, monthStartIso, monthEndIso } = useMemo(() => {
        const now = parseIsoDateLocal(toLocalIsoDate(new Date()));
        now.setHours(0, 0, 0, 0);

        const current = parseIsoDateLocal(cursorIso);
        current.setHours(0, 0, 0, 0);

        const monthIndex = current.getMonth();
        const year = current.getFullYear();

        const monthStart = new Date(current);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(year, monthIndex + 1, 1);
        monthEnd.setHours(0, 0, 0, 0);

        const startDate = new Date(current);
        const weekday = (startDate.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - weekday);
        startDate.setHours(0, 0, 0, 0);

        const days: MonthDay[] = [];
        const todayIso = toLocalIsoDate(now);

        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            d.setHours(0, 0, 0, 0);

            const iso = toLocalIsoDate(d);

            let state: MonthDayState;
            if (iso === todayIso) {
                state = "today";
            } else if (d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() < monthIndex)) {
                state = "prev";
            } else if (d.getFullYear() > year || (d.getFullYear() === year && d.getMonth() > monthIndex)) {
                state = "next";
            } else {
                state = "current";
            }

            days.push({
                date: d.getDate(),
                month: d.getMonth(),
                year: d.getFullYear(),
                isoDate: iso,
                state,
            });
        }

        return {
            days,
            monthLabel: `${MONTHS_SHORT[monthIndex]} ${year}`,
            monthStartIso: toLocalIsoDate(monthStart),
            monthEndIso: toLocalIsoDate(monthEnd),
        };
    }, [cursorIso]);

    useEffect(() => {
        setCursorIso(normalizedInitialIso);
    }, [normalizedInitialIso]);

    const next = () => setCursorIso((value) => nextMonthStartIso(value));
    const prev = () =>
        setCursorIso((value) => {
            const date = parseIsoDateLocal(value);
            date.setDate(1);
            date.setMonth(date.getMonth() - 1);
            return toLocalIsoDate(date);
        });
    const jumpToMonth = (dateIso: string) => setCursorIso(toMonthStartIso(dateIso));

    return {
        days,
        monthLabel,
        monthStartIso,
        monthEndIso,
        next,
        prev,
        jumpToMonth,
    };
}
