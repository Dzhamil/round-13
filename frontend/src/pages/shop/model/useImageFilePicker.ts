// frontend/src/pages/shop/model/useImageFilePicker.ts
import { useCallback, useMemo, useRef, useState } from "react";

const IMAGE_ACCEPT = "image/*";

function isDataImage(value: string): boolean {
    return value.trim().startsWith("data:image/");
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") resolve(result);
            else reject(new Error("Unexpected FileReader result"));
        };

        reader.onerror = () => reject(new Error("FileReader error"));

        reader.readAsDataURL(file);
    });
}

export function useImageFilePicker() {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [dataUrl, setDataUrl] = useState<string>("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const hasImage = useMemo(() => isDataImage(dataUrl), [dataUrl]);

    const openPicker = useCallback(() => {
        setError(null);
        inputRef.current?.click();
    }, []);

    const clear = useCallback(() => {
        setDataUrl("");
        setFileName(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    }, []);

    const onChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("Можно выбрать только изображение");
            return;
        }

        try {
            const url = await readFileAsDataUrl(file);
            setDataUrl(url);
        } catch {
            setError("Не удалось прочитать файл");
        }
    }, []);

    return {
        inputRef,
        accept: IMAGE_ACCEPT,

        dataUrl,
        fileName,
        error,
        hasImage,

        openPicker,
        clear,
        onChange,
    };
}