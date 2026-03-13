import React, { useEffect } from "react";
import { useMenuAudio } from "../lib/useMenuAudio";

type Props = {
    className?: string;
};

/**
 * Кнопка звука для использования ВНУТРИ хедера (без fixed).
 * Иконка:
 * - 🔊 если звук включен
 * - 🔇 если выключен
 */
export function SoundToggleButton({ className }: Props) {
    const { enabled, toggleEnabled, armAutoStart } = useMenuAudio();

    useEffect(() => {
        armAutoStart();
    }, [armAutoStart]);

    return (
        <button
            type="button"
            className={className}
            onClick={toggleEnabled}
            aria-label={enabled ? "Звук включен" : "Звук выключен"}
            title={enabled ? "Sound: ON" : "Sound: OFF"}
            style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                background: enabled ? "rgba(0,136,204,0.10)" : "rgba(0,0,0,0.06)",
                color: enabled ? "#0088cc" : "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                padding: 0,
                fontSize: 18,
                lineHeight: "18px",
            }}
        >
            {enabled ? "🔊" : "🔇"}
        </button>
    );
}
