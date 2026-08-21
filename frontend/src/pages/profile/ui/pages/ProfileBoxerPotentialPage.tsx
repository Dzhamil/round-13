import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMe } from "../../api/profile.api";
import {
    BOXER_POTENTIAL_CHARACTERISTICS,
    getCharacteristicConfig,
    getTestConfig,
} from "../../../members/model/boxerPotential.config";
import { formatPotentialDate, formatPotentialScore } from "../../../members/model/boxerPotential.helpers";
import type {
    BoxerPotentialCharacteristicKey,
    BoxerPotentialMeasurement,
    BoxerPotentialPeriod,
    BoxerPotentialTestKey,
} from "../../../members/model/boxerPotential.types";
import { useBoxerPotential } from "../../../members/model/useBoxerPotential";
import { profilePageStyles as s } from "../../styles/profilePage.styles";

const PERIOD_LABELS: Record<BoxerPotentialPeriod, string> = {
    week: "неделя",
    month: "месяц",
    year: "год",
};

function isCharacteristicKey(value: string | undefined): value is BoxerPotentialCharacteristicKey {
    return BOXER_POTENTIAL_CHARACTERISTICS.some((item) => item.key === value);
}

function isTestKey(value: string | undefined): value is BoxerPotentialTestKey {
    return Boolean(value && getTestConfig(value as BoxerPotentialTestKey));
}

function characteristicScore(measurement: BoxerPotentialMeasurement | null, key: BoxerPotentialCharacteristicKey): number {
    return measurement?.characteristicScores[key] ?? 0;
}

function testScore(measurement: BoxerPotentialMeasurement | null, key: BoxerPotentialTestKey): number {
    const config = getTestConfig(key);
    if (!measurement || !config) {
        return 0;
    }
    return measurement.testScores[config.scoreKey] ?? 0;
}

function filterByPeriod(history: BoxerPotentialMeasurement[], period: BoxerPotentialPeriod): BoxerPotentialMeasurement[] {
    const days = period === "week" ? 7 : period === "month" ? 31 : 365;
    const from = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter((measurement) => new Date(measurement.measuredAt).getTime() >= from);
}

function TestValueChart({
    history,
    testKey,
}: {
    history: BoxerPotentialMeasurement[]
    testKey: BoxerPotentialTestKey
}) {
    const config = getTestConfig(testKey);
    if (!config || history.length === 0) {
        return <div style={s.potentialEmpty}>График появится после первого замера.</div>;
    }

    const points = [...history].sort((left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime());
    const maxValue = Math.max(...points.map((point) => Number(point.raw[testKey])), 1);
    const width = 520;
    const height = 160;
    const paddingX = 30;
    const paddingY = 18;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;
    const xFor = (index: number) => points.length === 1 ? width / 2 : paddingX + (plotWidth * index) / (points.length - 1);
    const yFor = (value: number) => paddingY + plotHeight - (value / maxValue) * plotHeight;
    const d = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(Number(point.raw[testKey]))}`)
        .join(" ");

    return (
        <div style={s.detailChartCard}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={`График истории ${config.label}`}
                style={{ width: "100%", height: "auto", display: "block" }}
            >
                {[0, maxValue].map((tick) => (
                    <g key={tick}>
                        <line x1={paddingX} x2={width - paddingX} y1={yFor(tick)} y2={yFor(tick)} stroke="rgba(255,255,255,0.08)" />
                        <text x={4} y={yFor(tick) + 4} fill="#8b9bb0" fontSize="10">{formatPotentialScore(tick)}</text>
                    </g>
                ))}
                <path d={d} fill="none" stroke="var(--tg-theme-link-color, #62b0ff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point, index) => (
                    <circle key={`${point.id}-${point.measuredAt}`} cx={xFor(index)} cy={yFor(Number(point.raw[testKey]))} r="4" fill="var(--tg-theme-link-color, #62b0ff)" />
                ))}
            </svg>
            <div style={s.detailItemMeta}>{config.unit}</div>
        </div>
    );
}

function useSelfMemberId() {
    const [memberId, setMemberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const me = await fetchMe();
                if (!cancelled) {
                    setMemberId(me.id);
                }
            } catch {
                if (!cancelled) {
                    setMemberId(null);
                    setError("Не удалось загрузить профиль");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { memberId, loading, error };
}

export function ProfileBoxerPotentialCharacteristicPage() {
    const navigate = useNavigate();
    const { characteristicKey } = useParams();
    const { memberId, loading: profileLoading, error: profileError } = useSelfMemberId();
    const {
        summary,
        loading,
        error,
        reload,
    } = useBoxerPotential({
        memberId: memberId ?? "",
        enabled: Boolean(memberId),
        loadLeaderboard: false,
    });

    if (!isCharacteristicKey(characteristicKey)) {
        return <div style={s.status}>Характеристика не найдена</div>;
    }

    const characteristic = getCharacteristicConfig(characteristicKey);
    const latest = summary?.latest ?? null;

    return (
        <div style={s.root} data-testid="profile-boxer-potential-characteristic">
            <section style={s.detailHeader}>
                <button type="button" style={s.detailBackButton} onClick={() => navigate("/profile")}>
                    Назад
                </button>
                <div style={s.detailTitleRow}>
                    <h1 style={s.detailTitle}>{characteristic?.label}</h1>
                    <div style={s.detailValue}>{formatPotentialScore(characteristicScore(latest, characteristicKey))}</div>
                </div>
                <div style={s.detailText}>{characteristic?.description}</div>
            </section>

            {(profileLoading || loading) && <div style={s.status}>Загружаем потенциал...</div>}
            {(profileError || error) && (
                <button type="button" style={s.inlineRetryButton} onClick={() => void reload()}>
                    {profileError ?? error}. Повторить
                </button>
            )}

            {!profileLoading && !loading && summary && characteristic && (
                <section style={s.detailSection}>
                    <h2 style={s.detailSectionTitle}>Тесты характеристики</h2>
                    <div style={s.detailList}>
                        {characteristic.tests.map((testKey) => {
                            const test = getTestConfig(testKey);
                            if (!test) {
                                return null;
                            }
                            return (
                                <button
                                    key={test.key}
                                    type="button"
                                    style={s.detailItemButton}
                                    onClick={() => navigate(`/profile/boxer-potential/tests/${test.key}`)}
                                >
                                    <div style={s.detailItemTitleRow}>
                                        <span style={s.detailItemTitle}>{test.label}</span>
                                        <span style={s.potentialScaleValue}>{formatPotentialScore(testScore(latest, test.key))}</span>
                                    </div>
                                    <span style={s.detailItemMeta}>{test.normLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                    {!summary.latest && (
                        <div style={s.potentialEmpty}>
                            Замеров пока нет. Тесты доступны для просмотра, история и график появятся после тренерского замера.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export function ProfileBoxerPotentialTestPage() {
    const navigate = useNavigate();
    const { testKey } = useParams();
    const { memberId, loading: profileLoading, error: profileError } = useSelfMemberId();
    const [period, setPeriod] = useState<BoxerPotentialPeriod>("month");
    const {
        summary,
        loading,
        error,
        reload,
    } = useBoxerPotential({
        memberId: memberId ?? "",
        enabled: Boolean(memberId),
        loadLeaderboard: false,
    });

    const activeTest = isTestKey(testKey) ? getTestConfig(testKey) : null;
    const testHistory = useMemo(() => {
        return summary && activeTest ? filterByPeriod(summary.history, period) : [];
    }, [activeTest, period, summary]);

    if (!activeTest) {
        return <div style={s.status}>Тест не найден</div>;
    }

    return (
        <div style={s.root} data-testid="profile-boxer-potential-test">
            <section style={s.detailHeader}>
                <button
                    type="button"
                    style={s.detailBackButton}
                    onClick={() => navigate(`/profile/boxer-potential/${activeTest.characteristic}`)}
                >
                    Назад
                </button>
                <div style={s.detailTitleRow}>
                    <h1 style={s.detailTitle}>{activeTest.label}</h1>
                    <div style={s.detailValue}>{formatPotentialScore(testScore(summary?.latest ?? null, activeTest.key))}</div>
                </div>
                <div style={s.detailText}>{activeTest.description}</div>
                <div style={s.detailItemMeta}>{activeTest.normLabel}</div>
            </section>

            {(profileLoading || loading) && <div style={s.status}>Загружаем тест...</div>}
            {(profileError || error) && (
                <button type="button" style={s.inlineRetryButton} onClick={() => void reload()}>
                    {profileError ?? error}. Повторить
                </button>
            )}

            {!profileLoading && !loading && summary && (
                <>
                    <section style={s.detailSection}>
                        <h2 style={s.detailSectionTitle}>Период</h2>
                        <div style={s.detailPeriodRow}>
                            {(Object.keys(PERIOD_LABELS) as BoxerPotentialPeriod[]).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    style={s.detailPeriodButton(period === item)}
                                    onClick={() => setPeriod(item)}
                                >
                                    {PERIOD_LABELS[item]}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section style={s.detailSection}>
                        <h2 style={s.detailSectionTitle}>График истории</h2>
                        <TestValueChart history={testHistory} testKey={activeTest.key} />
                    </section>

                    <section style={s.detailSection}>
                        <h2 style={s.detailSectionTitle}>История по датам</h2>
                        {testHistory.length === 0 ? (
                            <div style={s.potentialEmpty}>За выбранный период замеров нет.</div>
                        ) : (
                            <div style={s.detailList}>
                                {testHistory.map((measurement) => (
                                    <div key={measurement.id} style={s.detailItem}>
                                        <div style={s.detailItemTitleRow}>
                                            <span style={s.detailItemTitle}>{formatPotentialDate(measurement.measuredAt)}</span>
                                            <span style={s.potentialScaleValue}>
                                                {formatPotentialScore(Number(measurement.raw[activeTest.key]))} {activeTest.unit}
                                            </span>
                                        </div>
                                        <div style={s.detailItemMeta}>
                                            Score: {formatPotentialScore(testScore(measurement, activeTest.key))} · Потенциал: {formatPotentialScore(measurement.potentialScore)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {!summary.latest && (
                        <div style={s.potentialEmpty}>
                            Замеров пока нет. Тренер сможет добавить первый замер из карточки участника.
                        </div>
                    )}
                    <span style={{ display: "none" }} data-testid="profile-boxer-potential-readonly">
                        {summary.canCreateMeasurement ? "editable" : "readonly"}
                    </span>
                </>
            )}
        </div>
    );
}
