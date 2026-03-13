// frontend/src/shared/ui/styles/hudTheme.ts

export const hudTheme = {
    // Цветовая схема адаптирована под светлую тему, напоминающую Telegram.
    colors: {
        // Основной акцентный цвет (Telegram‑синий)
        hudGreen: "#0088cc",
        hudGreen2: "rgba(0,136,204,0.75)",
        // Жёлтый заменяем на тот же акцент, поскольку жёлтый в светлой теме выглядел бы ярко
        hudYellow: "#0088cc",
        hudRed: "#d43d3d",
        // Текстовые цвета для светлого фона
        text: "#000000",
        textMuted: "#666666",
        textMuted2: "#888888",
    },

    fonts: {
        mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
    },

    gradients: {
        // Однородный светлый фон
        bg: "#ffffff",
        // Без эффекта сканирующих линий
        scan: "none",
        // Фон заголовков/панелей
        metal: "#f5f5f5",
    },

    effects: {
        // В светлой теме минимизируем тени и обводки
        inset: "none",
        outline: "none",
        shadow: "none",
        shadowBottom: "none",
    },
} as const;
