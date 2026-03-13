export const weekSwitcherButtonStyles = {
    root: {
        position: "absolute" as const,
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",

        width: 64,
        height: 64,
        borderRadius: "50%",

        border: "1px solid rgba(255,255,255,0.15)",

        background:
            "linear-gradient(180deg, rgba(80,150,255,0.9), rgba(40,110,220,0.9))",

        backdropFilter: "blur(10px)",

        color: "#fff",
        fontSize: 28,
        fontWeight: 600,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        boxShadow:
            "0 10px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",

        cursor: "pointer",
        zIndex: 10,
    },
};