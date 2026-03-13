export function shouldPlayClickSound(e: PointerEvent): boolean {
    // основной тап/клик
    if (e.button !== 0) return false;

    const target = e.target as Element | null;
    if (!target) return false;

    // точечное отключение
    if (target.closest("[data-click-sound='off']")) return false;

    // не озвучиваем поля ввода
    if (target.closest("input, textarea, select")) return false;

    const interactive = target.closest(
        [
            "button",
            "a[href]",
            "input[type='button']",
            "input[type='submit']",
            "[role='button']",
            "[data-click-sound]",
        ].join(",")
    );

    if (!interactive) return false;

    // disabled / aria-disabled
    const disabledNode = interactive.closest("button, input, [aria-disabled='true']");
    if (disabledNode instanceof HTMLButtonElement && disabledNode.disabled) return false;
    if (disabledNode instanceof HTMLInputElement && disabledNode.disabled) return false;
    if (disabledNode?.getAttribute?.("aria-disabled") === "true") return false;

    return true;
}
