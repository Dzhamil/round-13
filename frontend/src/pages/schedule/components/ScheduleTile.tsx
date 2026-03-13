// frontend/src/pages/schedule/components/ScheduleTile.tsx
import { scheduleTileStyles as s } from "./scheduleTile.styles";

type Props = {
    title: string;
    description: string;
    date: string;
    time: string;
};

export function ScheduleTile({ title, description, date, time }: Props) {
    return (
        <div style={s.card}>
            <div style={s.header}>
                <div style={s.title}>{title}</div>
                <div style={s.date}>{date}</div>
            </div>

            <div style={s.time}>{time}</div>

            <div style={s.description}>{description}</div>
        </div>
    );
}
