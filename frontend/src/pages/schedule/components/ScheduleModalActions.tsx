// frontend/src/pages/schedule/components/ScheduleModalActions.tsx
import { useState } from "react";

import {
    joinTrainingSession,
    cancelTrainingSession,
} from "../../../shared/api/training-join.api";
import { ScheduleModalError } from "./ScheduleModalError";
import { ScheduleModalJoinButton } from "./ScheduleModalJoinButton";
import { ScheduleModalCancelButton } from "./ScheduleModalCancelButton";
import { ScheduleModalCloseButton } from "./ScheduleModalCloseButton";

export function ScheduleModalActions({
                                         sessionId,
                                         onClose,
                                     }: {
    sessionId: string;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function join() {
        setError(null);
        setLoading(true);
        try {
            await joinTrainingSession(sessionId);
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось записаться");
        } finally {
            setLoading(false);
        }
    }

    async function cancel() {
        setError(null);
        setLoading(true);
        try {
            await cancelTrainingSession(sessionId);
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не удалось отменить запись");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "grid", gap: 8 }}>
            <ScheduleModalError message={error} />
            <ScheduleModalJoinButton onClick={join} disabled={loading} />
            <ScheduleModalCancelButton onClick={cancel} disabled={loading} />
            <ScheduleModalCloseButton onClick={onClose} />
        </div>
    );
}
