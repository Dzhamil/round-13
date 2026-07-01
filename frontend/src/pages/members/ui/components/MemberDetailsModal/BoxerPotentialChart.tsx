import { formatPotentialDate, formatPotentialScore } from "../../../model/boxerPotential.helpers";
import type { BoxerPotentialChartPoint } from "../../../model/boxerPotential.types";
import { EmptyState, MetaText, SectionCard } from "./memberDetailsModal.styles";

const SERIES = [
    { key: "potentialScore", label: "Потенциал", color: "#6ab3f3" },
    { key: "strengthScore", label: "Сила", color: "#63d28f" },
    { key: "enduranceScore", label: "Выносливость", color: "#f2b55a" },
    { key: "speedScore", label: "Скорость", color: "#d97bd9" },
    { key: "agilityScore", label: "Ловкость", color: "#7dd6c8" },
] as const;

type Props = {
    points: BoxerPotentialChartPoint[]
}

export function BoxerPotentialChart({ points }: Props) {
    if (points.length === 0) {
        return <EmptyState>График появится после первого замера.</EmptyState>;
    }

    const width = 520;
    const height = 180;
    const paddingX = 28;
    const paddingY = 18;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    const xFor = (index: number) => {
        if (points.length === 1) {
            return width / 2;
        }
        return paddingX + (plotWidth * index) / (points.length - 1);
    };
    const yFor = (value: number) => paddingY + plotHeight - (Math.max(0, Math.min(100, value)) / 100) * plotHeight;

    return (
        <SectionCard>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Динамика потенциала боксера" style={{ width: "100%", height: "auto", display: "block" }}>
                {[0, 50, 100].map((tick) => (
                    <g key={tick}>
                        <line x1={paddingX} x2={width - paddingX} y1={yFor(tick)} y2={yFor(tick)} stroke="rgba(255,255,255,0.08)" />
                        <text x={4} y={yFor(tick) + 4} fill="#8b9bb0" fontSize="10">{tick}</text>
                    </g>
                ))}

                {SERIES.map((series) => {
                    const d = points
                        .map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point[series.key])}`)
                        .join(" ");
                    return (
                        <path key={series.key} d={d} fill="none" stroke={series.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    );
                })}

                {points.map((point, index) => (
                    <circle key={`${point.measuredAt}-${index}`} cx={xFor(index)} cy={yFor(point.potentialScore)} r="4" fill="#6ab3f3" />
                ))}
            </svg>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {SERIES.map((series) => (
                    <MetaText key={series.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 999, background: series.color }} />
                        {series.label}
                    </MetaText>
                ))}
            </div>

            {points.length === 1 && (
                <MetaText style={{ marginTop: 8 }}>
                    {formatPotentialDate(points[0].measuredAt)}: {formatPotentialScore(points[0].potentialScore)}
                </MetaText>
            )}
        </SectionCard>
    );
}
