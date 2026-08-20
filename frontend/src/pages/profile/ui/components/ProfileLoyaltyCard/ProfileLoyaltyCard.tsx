import type { LoyaltyPointHistoryItem, LoyaltySummary } from "../../../../../shared/api/loyalty.api";
import {
    formatLoyaltyDate,
    formatLoyaltyDelta,
    getLoyaltyProgressLabel,
    getLoyaltyRankName,
    getLoyaltySourceLabel,
} from "../../../../../shared/api/loyalty.helpers";
import { profileLoyaltyCardStyles as s } from "./profileLoyaltyCard.styles";

type Props = {
    summary: LoyaltySummary | null;
    history: LoyaltyPointHistoryItem[];
    loading: boolean;
    errorText: string | null;
    onRetry: () => void;
};

export function ProfileLoyaltyCard({ summary, history, loading, errorText, onRetry }: Props) {
    const progress = Math.max(0, Math.min(100, summary?.progressPercent ?? 0));

    return (
        <section style={s.root} aria-label="Баллы лояльности">
            <div style={s.header}>
                <div>
                    <div style={s.eyebrow}>Баллы клуба</div>
                    <div style={s.title}>{loading ? "Загрузка..." : `${summary?.totalPoints ?? 0} очков`}</div>
                </div>
                <div style={s.rankPill}>{getLoyaltyRankName(summary)}</div>
            </div>

            {errorText ? (
                <div style={s.stateRow}>
                    <span>{errorText}</span>
                    <button type="button" style={s.retryButton} onClick={onRetry}>
                        Повторить
                    </button>
                </div>
            ) : (
                <>
                    <div style={s.progressWrap}>
                        <div style={s.progressHeader}>
                            <span>{getLoyaltyProgressLabel(summary)}</span>
                            <span>{progress}%</span>
                        </div>
                        <div style={s.progressTrack}>
                            <div style={s.progressFill(progress)} />
                        </div>
                    </div>

                    {summary?.currentAchievement?.description ? (
                        <div style={s.note}>{summary.currentAchievement.description}</div>
                    ) : null}

                    <div style={s.history}>
                        <div style={s.historyTitle}>Последние начисления</div>
                        {loading ? <div style={s.empty}>История загружается...</div> : null}
                        {!loading && history.length === 0 ? <div style={s.empty}>История баллов пока пустая.</div> : null}
                        {!loading && history.slice(0, 4).map((item) => (
                            <div key={item.id} style={s.historyItem}>
                                <div style={s.historyText}>
                                    <div style={s.historyReason}>{item.reason || getLoyaltySourceLabel(item.sourceType)}</div>
                                    <div style={s.historyMeta}>
                                        {getLoyaltySourceLabel(item.sourceType)}
                                        {item.eventDate ? ` · ${formatLoyaltyDate(item.eventDate)}` : ""}
                                    </div>
                                </div>
                                <div style={s.delta(item.pointsDelta >= 0)}>{formatLoyaltyDelta(item.pointsDelta)}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
