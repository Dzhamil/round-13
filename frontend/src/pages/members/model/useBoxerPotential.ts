import { useCallback, useEffect, useState } from "react";
import {
    createBoxerPotentialMeasurement,
    getBoxerPotentialLeaderboard,
    getBoxerPotentialSummary,
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
}

export function useBoxerPotential({ memberId, enabled }: Params) {
    const [summary, setSummary] = useState<BoxerPotentialSummary | null>(null);
    const [leaderboard, setLeaderboard] = useState<BoxerPotentialLeaderboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!memberId) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const nextSummary = await getBoxerPotentialSummary(memberId);
            setSummary(nextSummary);

            if (nextSummary.latest) {
                const nextLeaderboard = await getBoxerPotentialLeaderboard(nextSummary.latest.normGroup, 10);
                setLeaderboard(nextLeaderboard);
            } else {
                setLeaderboard(null);
            }
        } catch (nextError) {
            setError(getApiErrorMessage(nextError, "Не удалось загрузить потенциал боксера"));
        } finally {
            setLoading(false);
        }
    }, [memberId]);

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
        try {
            await createBoxerPotentialMeasurement(memberId, request);
            await load();
        } catch (nextError) {
            setError(getApiErrorMessage(nextError, "Не удалось сохранить замер потенциала"));
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
        reload: load,
        submit,
    };
}
