// frontend/src/pages/profile/ui/components/BirthDateSelect/BirthDateSelectView.tsx

import { birthDateSelectStyles as s } from "../../../styles/birthDateSelect.styles";

type Props = {
    label: string;
    help?: string;

    birthDay: string;
    birthMonth: string;
    birthYear: string;

    years: number[];
    dayOptions: number[];

    onDayChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onYearChange: (value: string) => void;
};

function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

export function BirthDateSelectView({
                                        label,
                                        help,
                                        birthDay,
                                        birthMonth,
                                        birthYear,
                                        years,
                                        dayOptions,
                                        onDayChange,
                                        onMonthChange,
                                        onYearChange,
                                    }: Props) {
    return (
        <div style={s.root}>
            <div style={s.label}>{label}</div>

            <div style={s.row}>
                <select
                    style={s.select}
                    value={birthDay}
                    onChange={(e) => onDayChange(e.target.value)}
                >
                    <option value="">дд</option>
                    {dayOptions.map((d) => (
                        <option key={d} value={String(d)}>
                            {pad2(d)}
                        </option>
                    ))}
                </select>

                <select
                    style={s.select}
                    value={birthMonth}
                    onChange={(e) => onMonthChange(e.target.value)}
                >
                    <option value="">мм</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={String(m)}>
                            {pad2(m)}
                        </option>
                    ))}
                </select>

                <select
                    style={s.select}
                    value={birthYear}
                    onChange={(e) => onYearChange(e.target.value)}
                >
                    <option value="">гггг</option>
                    {years.map((y) => (
                        <option key={y} value={String(y)}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>

            {help ? <div style={s.help}>{help}</div> : null}
        </div>
    );
}
