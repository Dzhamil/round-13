import { useNavigate } from "react-router-dom";
import {
    BOXER_POTENTIAL_CHARACTERISTICS,
} from "../../../../members/model/boxerPotential.config";
import { formatPotentialDate, formatPotentialScore } from "../../../../members/model/boxerPotential.helpers";
import type { BoxerPotentialCharacteristicKey } from "../../../../members/model/boxerPotential.types";
import { useBoxerPotential } from "../../../../members/model/useBoxerPotential";
import { profilePageStyles as s } from "../../../styles/profilePage.styles";

type Props = {
    memberId: string
};

function characteristicScore(
    scores: Partial<Record<BoxerPotentialCharacteristicKey, number>> | null | undefined,
    key: BoxerPotentialCharacteristicKey,
): number {
    return scores?.[key] ?? 0;
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, value));
}

export function ProfileBoxerPotentialBlock({ memberId }: Props) {
    const navigate = useNavigate();
    const {
        summary,
        loading,
        error,
        reload,
    } = useBoxerPotential({
        memberId,
        enabled: true,
        loadLeaderboard: false,
    });

    const latest = summary?.latest ?? null;
    const scores = latest?.characteristicScores ?? null;

    return (
        <section style={s.card} data-testid="profile-boxer-potential">
            <div style={s.sectionHeader}>
                <div>
                    <div style={s.cardTitle}>Потенциал боксера</div>
                    <div style={s.sectionHint}>
                        {latest
                            ? `Последний замер: ${formatPotentialDate(latest.measuredAt)}`
                            : "Шкалы появятся после первого тренерского замера."}
                    </div>
                </div>
                {latest && (
                    <div style={s.potentialTotal}>
                        {formatPotentialScore(latest.potentialScore)}
                    </div>
                )}
            </div>

            {loading && <div style={s.cardNote}>Загружаем потенциал...</div>}

            {error && (
                <button type="button" style={s.inlineRetryButton} onClick={() => void reload()}>
                    Не удалось загрузить потенциал. Повторить
                </button>
            )}

            {!loading && !error && !latest && (
                <div style={s.potentialEmpty}>
                    Замеров потенциала пока нет. Тренер сможет добавить первый замер из карточки участника.
                </div>
            )}

            <div style={s.potentialGrid} aria-label="Шкалы потенциала боксера">
                {BOXER_POTENTIAL_CHARACTERISTICS.map((characteristic) => {
                    const value = characteristicScore(scores, characteristic.key);
                    const width = clampPercent(value);

                    return (
                        <div key={characteristic.key} style={s.potentialScale}>
                            <div style={s.potentialScaleHeader}>
                                <span style={s.potentialScaleLabel}>{characteristic.label}</span>
                                <span style={s.potentialScaleValue}>{formatPotentialScore(value)}</span>
                                <button
                                    type="button"
                                    style={s.potentialOpenButton}
                                    aria-label="+"
                                    title={`Открыть ${characteristic.label}`}
                                    onClick={() => navigate(`/profile/boxer-potential/${characteristic.key}`)}
                                >
                                    +
                                </button>
                            </div>
                            <div style={s.potentialTrack} aria-hidden="true">
                                <div style={s.potentialFill(width)} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
