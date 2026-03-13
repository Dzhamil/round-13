import type { TrainingSessionResponse } from "../../../shared/api/training.api";
import { scheduleTileStyles as s } from "./scheduleTile.styles";
import {
    formatSessionDay,
    formatSessionTimeRange,
    getTrainingTypeLabel,
} from "./schedule.format";

type Props = {
    item: TrainingSessionResponse;
    onClick: () => void;
};

export function ScheduleTile({ item, onClick }: Props) {
    const coachLabel = item.coachName ?? "Тренер уточняется";
    const locationLabel = item.location ?? "Локация уточняется";
    const capacityLabel =
        item.capacity && item.capacity > 0
            ? `${item.participantsCount ?? 0}/${item.capacity} мест`
            : `${item.participantsCount ?? 0} записаны`;

    return (
        <button type="button" style={s.card} onClick={onClick}>
            <div style={s.topRow}>
                <div style={s.titleBlock}>
                    <div style={s.badges}>
                        <span style={s.badge}>{getTrainingTypeLabel(item.type)}</span>
                        <span style={s.dateBadge}>{formatSessionDay(item.startsAt)}</span>
                    </div>
                    <div style={s.title}>{item.title}</div>
                    <div style={s.meta}>{coachLabel}</div>
                </div>
            </div>

            <div style={s.time}>{formatSessionTimeRange(item.startsAt, item.endsAt)}</div>

            <div style={s.description}>
                {item.description?.trim() || "Подробности о занятии откроются по нажатию."}
            </div>

            <div style={s.footer}>
                <div style={s.footerMeta}>
                    <span>{locationLabel}</span>
                    <span>{capacityLabel}</span>
                </div>
                <span style={s.cta}>Подробнее</span>
            </div>
        </button>
    );
}
