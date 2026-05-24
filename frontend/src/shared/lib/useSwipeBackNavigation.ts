import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useBackNavigation } from "./navigation";

const EDGE_START_PX = 32;
const MIN_HORIZONTAL_DELTA_PX = 80;
const MAX_VERTICAL_DELTA_PX = 48;
const HORIZONTAL_DOMINANCE_RATIO = 1.75;

const SUPPRESSED_START_SELECTOR = [
    "a",
    "button",
    "input",
    "label",
    "select",
    "textarea",
    "[contenteditable=\"\"]",
    "[contenteditable=\"true\"]",
    "[data-swipe-back-exclude]",
    "[role=\"button\"]",
    "[role=\"slider\"]",
    "[role=\"tab\"]",
].join(",");

const OPEN_MODAL_SELECTOR = [
    "[aria-modal=\"true\"]",
    "[role=\"dialog\"]",
].join(",");

type SwipeStart = {
    pointerId: number;
    x: number;
    y: number;
};

function isSuppressedRoute(pathname: string): boolean {
    return pathname === "/" ||
        pathname === "/auth" ||
        pathname === "/admin" ||
        pathname === "/panel" ||
        pathname === "/admin/login";
}

function isElementTarget(target: EventTarget | null): target is Element {
    return target instanceof Element;
}

function hasOpenModal(): boolean {
    return Boolean(document.querySelector(OPEN_MODAL_SELECTOR));
}

function hasHorizontalScrollSurface(target: Element): boolean {
    let current: Element | null = target;

    while (current && current !== document.body && current !== document.documentElement) {
        const style = window.getComputedStyle(current);
        const scrollable = style.overflowX === "auto" ||
            style.overflowX === "scroll" ||
            style.overflowX === "overlay";

        if (scrollable && current.scrollWidth > current.clientWidth + 1) {
            return true;
        }

        current = current.parentElement;
    }

    return false;
}

function shouldSuppressStartTarget(target: EventTarget | null): boolean {
    if (!isElementTarget(target)) {
        return true;
    }

    return Boolean(target.closest(SUPPRESSED_START_SELECTOR)) || hasHorizontalScrollSurface(target);
}

function isTouchPointer(event: PointerEvent): boolean {
    return event.isPrimary !== false && event.pointerType === "touch";
}

function isSwipeBackGesture(start: SwipeStart, event: PointerEvent): boolean {
    const deltaX = event.clientX - start.x;
    const deltaY = Math.abs(event.clientY - start.y);
    const horizontalDominance = deltaX / Math.max(deltaY, 1);

    return deltaX >= MIN_HORIZONTAL_DELTA_PX &&
        deltaY <= MAX_VERTICAL_DELTA_PX &&
        horizontalDominance >= HORIZONTAL_DOMINANCE_RATIO;
}

export function useSwipeBackNavigation(): void {
    const location = useLocation();
    const { navigateBack, target } = useBackNavigation();

    useEffect(() => {
        if (!target || isSuppressedRoute(location.pathname)) {
            return;
        }

        let start: SwipeStart | null = null;

        const onPointerDown = (event: PointerEvent) => {
            if (!isTouchPointer(event) ||
                hasOpenModal() ||
                event.clientX > EDGE_START_PX ||
                shouldSuppressStartTarget(event.target)) {
                start = null;
                return;
            }

            start = {
                pointerId: event.pointerId,
                x: event.clientX,
                y: event.clientY,
            };
        };

        const onPointerUp = (event: PointerEvent) => {
            if (!start || event.pointerId !== start.pointerId) {
                return;
            }

            const currentStart = start;
            start = null;

            if (hasOpenModal() || !isSwipeBackGesture(currentStart, event)) {
                return;
            }

            navigateBack();
        };

        const onPointerCancel = () => {
            start = null;
        };

        const listenerOptions: AddEventListenerOptions = { passive: true };

        window.addEventListener("pointerdown", onPointerDown, listenerOptions);
        window.addEventListener("pointerup", onPointerUp, listenerOptions);
        window.addEventListener("pointercancel", onPointerCancel, listenerOptions);

        return () => {
            window.removeEventListener("pointerdown", onPointerDown, listenerOptions);
            window.removeEventListener("pointerup", onPointerUp, listenerOptions);
            window.removeEventListener("pointercancel", onPointerCancel, listenerOptions);
        };
    }, [location.pathname, navigateBack, target]);
}
