import type { TrainingSessionResponse } from "../../../shared/api/training.api";
import { schedulePageStyles as s } from "../schedulePage.styles";
import {
    formatSessionDateTime,
    formatSessionTime,
    getTrainingTypeLabel,
} from "./schedule.format";

export function ScheduleModalHeader({ tile }: { tile: TrainingSessionResponse }) {
    const placesLabel =
        tile.capacity && tile.capacity > 0
            ? `${tile.participantsCount ?? 0} из ${tile.capacity}`
            : `${tile.participantsCount ?? 0}`;

    return (
        <div style={s.modalHeader}>
            <div style={s.modalTopRow}>
                <h3 style={s.modalTitle}>{tile.title}</h3>
                <div style={s.modalBadgeRow}>
                    <span style={s.modalBadge}>{getTrainingTypeLabel(tile.type)}</span>
                </div>
            </div>

            <p style={s.modalDescription}>
                {tile.description?.trim() || "Описание занятия пока не добавлено."}
            </p>

            <div style={s.modalStatsGrid}>
                <div style={s.modalStatCard}>
                    <span style={s.modalStatLabel}>Когда</span>
                    <span style={s.modalStatValue}>
                        {formatSessionDateTime(tile.startsAt)}
                        <br />
                        {formatSessionTime(tile.startsAt)} - {formatSessionTime(tile.endsAt)}
                    </span>
                </div>
                <div style={s.modalStatCard}>
                    <span style={s.modalStatLabel}>Тренер</span>
                    <span style={s.modalStatValue}>{tile.coachName ?? "Уточняется"}</span>
                </div>
                <div style={s.modalStatCard}>
                    <span style={s.modalStatLabel}>Локация</span>
                    <span style={s.modalStatValue}>{tile.location ?? "Уточняется"}</span>
                </div>
                <div style={s.modalStatCard}>
                    <span style={s.modalStatLabel}>Запись</span>
                    <span style={s.modalStatValue}>{placesLabel}</span>
                </div>
            </div>
        </div>
    );
}
