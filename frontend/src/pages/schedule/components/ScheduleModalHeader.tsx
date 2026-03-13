import type { TrainingSessionResponse } from "../../../shared/api/training.api";

export function ScheduleModalHeader({ tile }: { tile: TrainingSessionResponse }) {
    return (
        <>
            <h3 style={{ marginTop: 0 }}>{tile.title}</h3>
            <div style={{ opacity: 0.8, marginBottom: 12 }}>
                {tile.startsAt} – {tile.endsAt}
            </div>
        </>
    );
}
