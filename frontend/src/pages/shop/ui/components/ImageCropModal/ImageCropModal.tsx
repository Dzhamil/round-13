// frontend/src/pages/shop/ui/components/ImageCropModal/ImageCropModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";

import type { ImgMeta, Logger } from "../../../model/cropSquareImage";
import {
    clampOffsets,
    computeBaseScale,
    computeBounds,
    cropToSquareDataUrl,
    isUsableImageSrc,
    readImageMeta,
} from "../../../model/cropSquareImage";
import { useDragPan } from "../../../model/useDragPan";
import { ModalShell } from "../ModalShell/ModalShell";

type Props = {
    open: boolean;
    src: string | null;
    title?: string;
    onCancel: () => void;
    onSave: (croppedDataUrl: string) => void | Promise<void>;
    outputSize?: number;
};

export function ImageCropModal({ open, src, title = "Обрезка", onCancel, onSave, outputSize = 512 }: Props) {
    const cropRef = useRef<HTMLDivElement | null>(null);

    const [img, setImg] = useState<ImgMeta | null>(null);
    const [cropSize, setCropSize] = useState<number | null>(null);

    const [scale, setScale] = useState(1);
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);

    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const log: Logger = useMemo(() => {
        const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;
        if (!isDev) return () => undefined;
        return (event, data) => {
            // eslint-disable-next-line no-console
            console.log(`[ImageCropModal] ${event}`, data ?? {});
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        const measure = () => {
            const el = cropRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const size = Math.floor(Math.min(rect.width, rect.height));
            setCropSize(size > 0 ? size : null);
        };

        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        setSaving(false);
        setError(null);
        setImg(null);

        setScale(1);
        setDx(0);
        setDy(0);

        if (!src || !isUsableImageSrc(src)) return;

        readImageMeta(src)
            .then((meta) => {
                setImg(meta);
                log("image:meta", meta);
            })
            .catch(() => {
                setError("Не удалось загрузить изображение");
                log("image:error");
            });
    }, [open, src, log]);

    const baseScale = useMemo(() => {
        if (!img || !cropSize) return 1;
        return computeBaseScale(img, cropSize);
    }, [img, cropSize]);

    const displayScale = baseScale * scale;

    const bounds = useMemo(() => {
        if (!img || !cropSize) return null;
        return computeBounds(img, cropSize, displayScale);
    }, [img, cropSize, displayScale]);

    useEffect(() => {
        if (!bounds) return;
        const clamped = clampOffsets(dx, dy, bounds);
        if (clamped.dx !== dx) setDx(clamped.dx);
        if (clamped.dy !== dy) setDy(clamped.dy);
    }, [bounds, dx, dy]);

    const drag = useDragPan({
        enabled: open && !saving,
        bounds: bounds ? { maxX: bounds.maxX, maxY: bounds.maxY } : null,
        dx,
        dy,
        setDx,
        setDy,
        logger: log,
    });

    if (!open) return null;

    const hasValidSrc = Boolean(src && isUsableImageSrc(src));
    const canSave = Boolean(hasValidSrc && img && cropSize && bounds && !saving);

    const cancel = () => {
        if (saving) return;
        onCancel();
    };

    const onZoomChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (saving) return;
        const v = Number(e.target.value);
        if (!Number.isFinite(v)) return;
        setScale(v);
        log("zoom:change", { scale: v });
    };

    const save = async () => {
        if (!src || !img || !cropSize) return;
        if (saving) return;

        setSaving(true);
        try {
            setError(null);

            const out = await cropToSquareDataUrl({
                src,
                img,
                state: {
                    cropSize,
                    baseScale,
                    userScale: scale,
                    dx,
                    dy,
                },
                outputSize,
                mimeType: "image/jpeg",
                quality: 0.92,
                logger: log,
            });

            await onSave(out);
        } catch {
            setError("Не удалось сохранить обрезку");
            log("crop:error");
            setSaving(false);
        }
    };

    const cropAreaStyle = drag.isDragging
        ? { ...s.modalCropArea, ...s.modalCropAreaGrabbing }
        : { ...s.modalCropArea, ...s.modalCropAreaGrab };

    const imgVarsStyle =
        img && cropSize
            ? {
                ...s.modalCropImage,
                ["--crop-width" as any]: `${img.w * baseScale}px`,
                ["--crop-height" as any]: `${img.h * baseScale}px`,
                ["--crop-transform" as any]: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`,
            }
            : s.modalCropImage;

    return (
        <ModalShell onClose={cancel}>
            <div style={s.modalCropCard} onMouseDown={(e) => e.stopPropagation()}>
                <div style={s.modalHeaderRow}>
                    <div style={s.modalTitle}>{title}</div>
                    <button type="button" onClick={cancel} aria-label="Закрыть" style={s.modalCloseBtn} disabled={saving}>
                        ✕
                    </button>
                </div>

                <div style={s.modalCropScroll}>
                    {!hasValidSrc ? (
                        <div style={s.modalText}>Нет изображения для обрезки.</div>
                    ) : (
                        <>
                            <div
                                data-swipe-back-exclude
                                ref={cropRef}
                                style={cropAreaStyle}
                                onMouseDown={drag.onMouseDown}
                                onTouchStart={drag.onTouchStart}
                            >
                                {src && img && cropSize && <img src={src} alt="crop" draggable={false} style={imgVarsStyle} />}
                            </div>

                            <div style={s.modalCropControlsRow}>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    value={scale}
                                    onChange={onZoomChange}
                                    style={s.modalCropRange}
                                    aria-label="Масштаб"
                                    disabled={saving}
                                />
                            </div>

                            <div style={s.modalCropHint}>Потяни картинку, чтобы сдвинуть. Ползунок — масштаб.</div>

                            {error && <div style={s.modalErrorText}>{error}</div>}
                        </>
                    )}
                </div>

                <div style={s.modalCropFooter}>
                    <div style={s.modalButtonsRow}>
                        <button type="button" onClick={cancel} style={s.modalBtn} disabled={saving}>
                            Отменить
                        </button>

                        <button
                            type="button"
                            onClick={() => void save()}
                            style={{ ...s.modalBtn, ...s.modalBtnPrimary }}
                            disabled={!canSave}
                        >
                            {saving ? "Сохраняем..." : "Готово"}
                        </button>
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
