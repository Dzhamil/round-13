// frontend/src/pages/profile/ui/components/BirthDateSelect/BirthDateSelect.tsx

import { useEffect, useMemo, useState } from "react";
import { BirthDateSelectView } from "./BirthDateSelectView";

type Props = {
    label: string;
    help?: string;
    value: string | null;
    onChange: (value: string | null) => void;
    maxYearsBack?: number;
};

function splitIso(value: string | null): { y: string; m: string; d: string } {
    if (!value) return { y: "", m: "", d: "" };
    const [y, m, d] = value.split("-");
    return { y: y ?? "", m: m ?? "", d: d ?? "" };
}

function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

export function BirthDateSelect({
                                    label,
                                    help,
                                    value,
                                    onChange,
                                    maxYearsBack = 90,
                                }: Props) {
    const initial = useMemo(() => splitIso(value), [value]);

    const [birthYear, setBirthYear] = useState(initial.y);
    const [birthMonth, setBirthMonth] = useState(initial.m);
    const [birthDay, setBirthDay] = useState(initial.d);

    useEffect(() => {
        const next = splitIso(value);
        setBirthYear(next.y);
        setBirthMonth(next.m);
        setBirthDay(next.d);
    }, [value]);

    const nowYear = new Date().getFullYear();

    const years = useMemo(() => {
        const arr: number[] = [];
        for (let y = nowYear; y >= nowYear - maxYearsBack; y--) arr.push(y);
        return arr;
    }, [nowYear, maxYearsBack]);

    const daysInMonth = useMemo(() => {
        const y = Number(birthYear);
        const m = Number(birthMonth);
        if (!y || !m) return 31;
        return new Date(y, m, 0).getDate();
    }, [birthYear, birthMonth]);

    const dayOptions = useMemo(() => {
        const max = daysInMonth || 31;
        return Array.from({ length: max }, (_, i) => i + 1);
    }, [daysInMonth]);

    useEffect(() => {
        const d = Number(birthDay);
        if (d && d > daysInMonth) setBirthDay("");
    }, [daysInMonth, birthDay]);

    useEffect(() => {
        const y = Number(birthYear);
        const m = Number(birthMonth);
        const d = Number(birthDay);

        if (!y || !m || !d) {
            onChange(null);
            return;
        }

        onChange(`${y}-${pad2(m)}-${pad2(d)}`);
    }, [birthYear, birthMonth, birthDay]);

    return (
        <BirthDateSelectView
            label={label}
            help={help}
            birthDay={birthDay}
            birthMonth={birthMonth}
            birthYear={birthYear}
            years={years}
            dayOptions={dayOptions}
            onDayChange={setBirthDay}
            onMonthChange={setBirthMonth}
            onYearChange={setBirthYear}
        />
    );
}
