import { useCallback, useEffect, useState } from "react";
import {
    createBoxerPotentialMeasurement,
    getBoxerPotentialLeaderboard,
    getBoxerPotentialSummary,
    updateBoxerPotentialMeasurement,
} from "../api/boxerPotential.api";
import { getApiErrorMessage } from "./boxerPotential.helpers";
import type {
    BoxerPotentialLeaderboard,
    BoxerPotentialMeasurementRequest,
    BoxerPotentialSummary,
} from "./boxerPotential.types";

type Params = {
    memberId: string | null
    enabled: boolean
    loadLeaderboard?: boolean
}

export function useBoxerPotential({ memberId, enabled, loadLeaderboard = true }: Params) {
    const [summary, setSummary] = useState<BoxerPotentialSummary | null>(null);
    const [leaderboard, setLeaderboard] = useState<BoxerPotentialLeaderboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!memberId) {
            return;
        }

        setLoading(true);
        setError(null);
        setLeaderboardError(null);
        try {
            const nextSummary = await getBoxerPotentialSummary(memberId);
            setSummary(nextSummary);

            if (loadLeaderboard && nextSummary.latest) {
                try {
                    const nextLeaderboard = await getBoxerPotentialLeaderboard(nextSummary.latest.normGroup, 10);
                    setLeaderboard(nextLeaderboard);
                } catch {
                    setLeaderboard(null);
                    setLeaderboardError("Не удалось загрузить рейтинг потенциала");
                }
            } else {
                setLeaderboard(null);
            }
        } catch (nextError) {
            setSummary(null);
            setLeaderboard(null);
            setError(getApiErrorMessage(nextError, "Не удалось загрузить потенциал боксера"));
        } finally {
            setLoading(false);
        }
    }, [loadLeaderboard, memberId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        void load();
    }, [enabled, load]);

    const submit = useCallback(async (request: BoxerPotentialMeasurementRequest) => {
        if (!memberId) {
            return;
        }

        setSaving(true);
        setError(null);
        setLeaderboardError(null);
        try {
            await createBoxerPotentialMeasurement(memberId, request);
            await load();
        } catch (nextError) {
            setError(getApiErrorMessage(nextError, "Не удалось сохранить замер потенциала"));
        } finally {
            setSaving(false);
        }
    }, [load, memberId]);

    const update = useCallback(async (measurementId: string, request: BoxerPotentialMeasurementRequest) => {
        if (!memberId) {
            return;
        }

        setSaving(true);
        setError(null);
        setLeaderboardError(null);
        try {
            await updateBoxerPotentialMeasurement(memberId, measurementId, request);
            await load();
        } catch (nextError) {
            setError(getApiErrorMessage(nextError, "Не удалось обновить замер потенциала"));
        } finally {
            setSaving(false);
        }
    }, [load, memberId]);

    return {
        summary,
        leaderboard,
        loading,
        saving,
        error,
        leaderboardError,
        reload: load,
        submit,
        update,
    };
}
