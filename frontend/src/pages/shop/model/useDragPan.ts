// frontend/src/pages/shop/model/useDragPan.ts
import { useEffect, useMemo, useRef } from "react";
import type { Logger } from "./cropSquareImage";

type DragState = {
    startX: number;
    startY: number;
    startDx: number;
    startDy: number;
};

type Bounds = {
    maxX: number;
    maxY: number;
};

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export function useDragPan(params: {
    enabled: boolean;
    bounds: Bounds | null;

    dx: number;
    dy: number;
    setDx: (v: number) => void;
    setDy: (v: number) => void;

    logger?: Logger;
}) {
    const { enabled, bounds, dx, dy, setDx, setDy, logger } = params;

    const log = useMemo<Logger>(() => logger ?? (() => undefined), [logger]);

    const dragRef = useRef<DragState | null>(null);

    const begin = (clientX: number, clientY: number) => {
        if (!enabled || !bounds) return;

        dragRef.current = {
            startX: clientX,
            startY: clientY,
            startDx: dx,
            startDy: dy,
        };

        log("drag:start", { clientX, clientY, dx, dy, maxX: bounds.maxX, maxY: bounds.maxY });
    };

    const move = (clientX: number, clientY: number) => {
        if (!enabled || !bounds) return;
        const d = dragRef.current;
        if (!d) return;

        const nextDx = clamp(d.startDx + (clientX - d.startX), -bounds.maxX, bounds.maxX);
        const nextDy = clamp(d.startDy + (clientY - d.startY), -bounds.maxY, bounds.maxY);

        setDx(nextDx);
        setDy(nextDy);

        log("drag:move", { clientX, clientY, nextDx, nextDy });
    };

    const end = () => {
        if (!dragRef.current) return;
        dragRef.current = null;
        log("drag:end");
    };

    useEffect(() => {
        if (!enabled) {
            dragRef.current = null;
            return;
        }

        const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
        const onMouseUp = () => end();

        const onTouchMove = (e: TouchEvent) => {
            // если тащим, не даём странице скроллиться
            if (dragRef.current) e.preventDefault();
            const t = e.touches[0];
            if (!t) return;
            move(t.clientX, t.clientY);
        };
        const onTouchEnd = () => end();

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("touchcancel", onTouchEnd);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);

            window.removeEventListener("touchmove", onTouchMove as any);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
        };
        // bounds deliberately included to keep clamping correct
    }, [enabled, bounds?.maxX, bounds?.maxY]);

    return {
        isDragging: Boolean(dragRef.current),

        onMouseDown: (e: React.MouseEvent) => begin(e.clientX, e.clientY),
        onTouchStart: (e: React.TouchEvent) => {
            const t = e.touches[0];
            if (!t) return;
            begin(t.clientX, t.clientY);
        },
        resetDrag: () => {
            dragRef.current = null;
            log("drag:reset");
        },
    };
}