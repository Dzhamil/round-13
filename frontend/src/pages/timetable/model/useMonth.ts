// frontend/src/pages/timetable/model/useMonth.ts
import { useMemo, useState } from "react";
import { MONTHS_SHORT } from "./timetable.constants";

export type MonthDayState = "prev" | "current" | "next" | "today";

export type MonthDay = {
    date: number;
    month: number;
    year: number;
    isoDate: string;
    state: MonthDayState;
};

function toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function useMonth() {
    const [offset, setOffset] = useState(0);

    const { days, monthLabel, monthStartIso, monthEndIso } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const current = new Date(now.getFullYear(), now.getMonth() + offset, 1);
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
    }, [offset]);

    const next = () => setOffset((value) => value + 1);
    const prev = () => setOffset((value) => value - 1);

    return {
        days,
        monthLabel,
        monthStartIso,
        monthEndIso,
        next,
        prev,
    };
}