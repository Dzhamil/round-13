// frontend/src/pages/home/RadialMenu.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { radialMenuStyles as s } from "./radialMenu.styles";
import css from "./radialMenu.module.css";

type MenuItem = {
    label: string;
    to: string;
    icon: string;
};

const MENU: MenuItem[] = [
    { label: "Профиль", to: "/profile", icon: "👤" },
    { label: "Афиша", to: "/schedule", icon: "📅" },
    { label: "Расписание", to: "/timetable", icon: "🗓" },
    { label: "Магазин", to: "/shop", icon: "🛒" },
    { label: "Участники", to: "/members", icon: "🥊" },
];

function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startDeg: number,
    endDeg: number,
) {
    const sDeg = startDeg - 90;
    const eDeg = endDeg - 90;

    const p1 = polar(cx, cy, rOuter, sDeg);
    const p2 = polar(cx, cy, rOuter, eDeg);
    const p3 = polar(cx, cy, rInner, eDeg);
    const p4 = polar(cx, cy, rInner, sDeg);

    const large = endDeg - startDeg > 180 ? 1 : 0;

    return [
        `M ${p1.x} ${p1.y}`,
        `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
        `L ${p3.x} ${p3.y}`,
        `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
        "Z",
    ].join(" ");
}

function splitLabel(label: string): { line1: string; line2?: string } {
    const trimmed = label.trim();
    if (!trimmed) return { line1: "" };

    // В wheel лучше, когда заголовок короткий и плотный.
    if (trimmed.length <= 10) return { line1: trimmed };

    const parts = trimmed.split(/\s+/g).filter(Boolean);
    if (parts.length >= 2) {
        const mid = Math.ceil(parts.length / 2);
        return {
            line1: parts.slice(0, mid).join(" "),
            line2: parts.slice(mid).join(" "),
        };
    }

    return { line1: trimmed };
}

export function RadialMenu() {
    const navigate = useNavigate();

    const [pressedIndex, setPressedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const size = 340;
    const cx = size / 2;
    const cy = size / 2;

    const rOuter = 160;
    const rInner = 86;

    // ВАЖНО: контент (иконка+текст) держим внутри сегмента,
    // чтобы ничего не "задевало" окружность и выглядело аккуратно.
    const contentR = Math.round(rInner + (rOuter - rInner) * 0.56);

    // Размер блока с контентом сегмента.
    const contentW = 120;
    const contentH = 72;

    const sliceDeg = 360 / MENU.length;

    const slices = useMemo(() => {
        return MENU.map((item, i) => {
            const start = i * sliceDeg;
            const end = start + sliceDeg;
            const mid = start + sliceDeg / 2;

            const pos = polar(cx, cy, contentR, mid - 90);

            return {
                item,
                path: donutSlicePath(cx, cy, rOuter, rInner, start, end),
                contentBox: {
                    x: pos.x - contentW / 2,
                    y: pos.y - contentH / 2,
                    w: contentW,
                    h: contentH,
                },
                labelLines: splitLabel(item.label),
            };
        });
    }, [cx, cy, rOuter, rInner, contentR, contentW, contentH, sliceDeg]);

    const activeIndex = pressedIndex ?? hoveredIndex;

    function clearStates() {
        setPressedIndex(null);
        setHoveredIndex(null);
    }

    return (
        <div style={s.root}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={s.svg}
                onPointerLeave={clearStates}
            >
                <defs>
                    <radialGradient id="wheelBg" cx="50%" cy="45%" r="70%">
                        <stop offset="0%" stopColor="#1a2030" />
                        <stop offset="100%" stopColor="#070a12" />
                    </radialGradient>

                    <radialGradient id="activeGlow" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="rgba(78,163,255,0.45)" />
                        <stop offset="100%" stopColor="rgba(78,163,255,0.00)" />
                    </radialGradient>
                </defs>

                <circle cx={cx} cy={cy} r={rOuter + 10} fill="#05060a" />
                <circle cx={cx} cy={cy} r={rOuter} fill="url(#wheelBg)" />

                {slices.map((it, i) => {
                    const isActive = activeIndex === i;
                    const isPressed = pressedIndex === i;

                    const fill = isPressed
                        ? "rgba(78,163,255,0.18)"
                        : isActive
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(255,255,255,0.035)";

                    const stroke = isActive ? "rgba(78,163,255,0.45)" : "rgba(255,255,255,0.10)";

                    return (
                        <g key={it.item.to}>
                            <path
                                d={it.path}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={1}
                                onPointerEnter={() => setHoveredIndex(i)}
                                onPointerLeave={() => {
                                    setHoveredIndex(null);
                                    setPressedIndex(null);
                                }}
                                onPointerDown={() => setPressedIndex(i)}
                                onPointerUp={() => {
                                    setPressedIndex(null);
                                    navigate(it.item.to);
                                }}
                                style={s.slice}
                            />

                            {isActive && <path d={it.path} fill="url(#activeGlow)" pointerEvents="none" />}

                            {/* Контент сегмента рисуем через foreignObject, чтобы аккуратно выровнять иконку + текст.
                               pointerEvents выключаем, чтобы клики всегда ловил path сегмента. */}
                            <foreignObject
                                x={it.contentBox.x}
                                y={it.contentBox.y}
                                width={it.contentBox.w}
                                height={it.contentBox.h}
                                pointerEvents="none"
                            >
                                <div
                                    xmlns="http://www.w3.org/1999/xhtml"
                                    className={`${css.segmentBox} ${isActive ? css.segmentBoxActive : ""}`}
                                >
                                    <div className={css.segmentIcon}>{it.item.icon}</div>

                                    <div className={css.segmentText}>
                                        <div className={css.segmentLine}>{it.labelLines.line1}</div>
                                        {it.labelLines.line2 && (
                                            <div className={css.segmentLine}>{it.labelLines.line2}</div>
                                        )}
                                    </div>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}

                <circle cx={cx} cy={cy} r={rInner} fill="#05060a" />

                <foreignObject
                    x={cx - (rInner - 20)}
                    y={cy - (rInner - 20)}
                    width={(rInner - 20) * 2}
                    height={(rInner - 20) * 2}
                >
                    <div xmlns="http://www.w3.org/1999/xhtml" className={css.centerWrap}>
                        <button type="button" onClick={() => navigate("/about")} className={css.centerButton}>
                            О нас
                        </button>
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
}

export default RadialMenu;
