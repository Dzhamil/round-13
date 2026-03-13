// frontend/src/pages/timetable/ui/components/CreateTrainingButton/createTrainingButton.styles.ts

import type { CSSProperties } from "react"

export const createTrainingButtonStyles: Record<string, CSSProperties> = {

    button: {
        position: "fixed",
        right: "18px",
        bottom: "26px",
        width: "58px",
        height: "58px",
        borderRadius: "29px",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(73,170,241,0.28), rgba(39,120,198,0.18))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: "#f4fbff",
        fontSize: "34px",
        fontWeight: 300,
        lineHeight: 1,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        cursor: "pointer",
        boxShadow: "0 10px 26px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12)"
    }

}
