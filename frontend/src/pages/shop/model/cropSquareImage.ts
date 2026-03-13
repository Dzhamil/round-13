// frontend/src/pages/shop/model/cropSquareImage.ts
export type ImgMeta = {
    w: number;
    h: number;
};

export type CropBounds = {
    displayedW: number;
    displayedH: number;
    maxX: number;
    maxY: number;
};

export type CropState = {
    cropSize: number;      // размер квадрата на экране (px)
    baseScale: number;     // чтобы покрыть квадрат при userScale=1
    userScale: number;     // 1..3
    dx: number;            // смещение в координатах crop-квадрата (px)
    dy: number;
};

export type SourceRect = {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
};

export type Logger = (event: string, data?: Record<string, unknown>) => void;

export function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export function isUsableImageSrc(value: string | null): boolean {
    if (!value) return false;
    const v = value.trim();
    return v.startsWith("data:image/") || v.startsWith("blob:") || v.startsWith("http");
}

export function readImageMeta(src: string): Promise<ImgMeta> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ w: image.naturalWidth, h: image.naturalHeight });
        image.onerror = () => reject(new Error("Image load error"));
        image.src = src;
    });
}

export function computeBaseScale(img: ImgMeta, cropSize: number): number {
    const sx = cropSize / img.w;
    const sy = cropSize / img.h;
    return Math.max(sx, sy);
}

export function computeBounds(img: ImgMeta, cropSize: number, displayScale: number): CropBounds {
    const displayedW = img.w * displayScale;
    const displayedH = img.h * displayScale;

    const maxX = Math.max(0, (displayedW - cropSize) / 2);
    const maxY = Math.max(0, (displayedH - cropSize) / 2);

    return { displayedW, displayedH, maxX, maxY };
}

export function clampOffsets(dx: number, dy: number, bounds: CropBounds): { dx: number; dy: number } {
    return {
        dx: clamp(dx, -bounds.maxX, bounds.maxX),
        dy: clamp(dy, -bounds.maxY, bounds.maxY),
    };
}

export function computeSourceRect(img: ImgMeta, state: CropState): SourceRect {
    const displayScale = state.baseScale * state.userScale;
    const bounds = computeBounds(img, state.cropSize, displayScale);

    const { dx, dy } = clampOffsets(state.dx, state.dy, bounds);

    // позиция картинки в квадрате
    const imageLeft = (state.cropSize - bounds.displayedW) / 2 + dx;
    const imageTop = (state.cropSize - bounds.displayedH) / 2 + dy;

    // координаты в исходнике
    const srcX = (-imageLeft) / displayScale;
    const srcY = (-imageTop) / displayScale;
    const srcW = state.cropSize / displayScale;
    const srcH = state.cropSize / displayScale;

    // clamp на границы исходника
    const sx = clamp(srcX, 0, img.w);
    const sy = clamp(srcY, 0, img.h);
    const sw = clamp(srcW, 0, img.w - sx);
    const sh = clamp(srcH, 0, img.h - sy);

    return { sx, sy, sw, sh };
}

export async function cropToSquareDataUrl(params: {
    src: string;
    img: ImgMeta;
    state: CropState;
    outputSize: number;
    mimeType?: "image/jpeg" | "image/png";
    quality?: number; // только для jpeg
    logger?: Logger;
}): Promise<string> {
    const {
        src,
        img,
        state,
        outputSize,
        mimeType = "image/jpeg",
        quality = 0.92,
        logger,
    } = params;

    const log = logger ?? (() => undefined);

    log("crop:start", {
        cropSize: state.cropSize,
        baseScale: state.baseScale,
        userScale: state.userScale,
        dx: state.dx,
        dy: state.dy,
        outputSize,
        mimeType,
    });

    const rect = computeSourceRect(img, state);

    log("crop:rect", rect);

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        log("crop:error", { reason: "no-canvas-context" });
        throw new Error("No canvas context");
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error("Image load error"));
        im.src = src;
    });

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, outputSize, outputSize);

    const out =
        mimeType === "image/png"
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", quality);

    log("crop:done", { outLength: out.length });

    return out;
}