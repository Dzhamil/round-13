import type { TrainingSessionResponse } from "../../../shared/api/training.api";
import {
    ScheduleModalActions,
    ScheduleModalHeader,
    ScheduleModalShell,
} from "./index";

/**
 * Модалка деталей тренировки.
 */
export function ScheduleDetailsModal({
                                         tile,
                                         onClose,
                                     }: {
    tile: TrainingSessionResponse | null;
    onClose: () => void;
}) {
    if (!tile) return null;

    return (
        <ScheduleModalShell>
            <ScheduleModalHeader tile={tile} />
            <ScheduleModalActions sessionId={tile.id} onClose={onClose} />
        </ScheduleModalShell>
    );
}
