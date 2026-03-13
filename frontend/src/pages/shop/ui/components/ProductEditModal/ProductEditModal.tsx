import { useEffect, useRef, useState } from "react";
import type { UpsertShopProductRequest } from "../../../api/product.api";
import { useImageFilePicker } from "../../../model/useImageFilePicker";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";
import { ImageCropModal } from "../ImageCropModal/ImageCropModal";

type Props = {
    open: boolean;
    categoryId: string;
    onCancel: () => void;
    onSave: (data: UpsertShopProductRequest) => void | Promise<void>;
};

export function ProductEditModal({ open, categoryId, onCancel, onSave }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priceRubles, setPriceRubles] = useState("");
    const [croppedImageUrl, setCroppedImageUrl] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState<string | null>(null);

    const { inputRef, accept, dataUrl, hasImage, openPicker, clear, onChange } = useImageFilePicker();
    const lastCropSrcRef = useRef<string>("");

    const clearPickerOnly = () => {
        clear();
        setCropOpen(false);
        setCropSrc(null);
        lastCropSrcRef.current = "";
    };

    const clearAllImage = () => {
        clearPickerOnly();
        setCroppedImageUrl("");
    };

    useEffect(() => {
        if (!open) return;
        setTitle("");
        setDescription("");
        setPriceRubles("");
        setCroppedImageUrl("");
        setLocalError(null);
        clearPickerOnly();
    }, [open, categoryId]);

    useEffect(() => {
        if (!open || !hasImage || !dataUrl) return;
        if (lastCropSrcRef.current === dataUrl) return;

        lastCropSrcRef.current = dataUrl;
        setCropSrc(dataUrl);
        setCropOpen(true);
    }, [open, hasImage, dataUrl]);

    if (!open) return null;

    const handleSave = () => {
        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();
        const parsedPrice = Number(priceRubles.replace(",", "."));

        if (!normalizedTitle) {
            setLocalError("Укажите название товара.");
            return;
        }

        if (!normalizedDescription) {
            setLocalError("Добавьте описание товара.");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            setLocalError("Укажите корректную цену.");
            return;
        }

        setLocalError(null);

        void onSave({
            title: normalizedTitle,
            description: normalizedDescription,
            categoryId,
            priceAmount: Math.round(parsedPrice * 100),
            currency: "RUB",
            imageDataUrl: croppedImageUrl || undefined,
            active: true,
            sortOrder: 0,
        });
    };

    return (
        <div style={s.modalOverlay}>
            <div style={s.modalCard}>
                <div style={s.modalHeaderRow}>
                    <div style={s.modalTitle}>Добавить товар</div>
                    <button type="button" onClick={onCancel} style={s.modalCloseBtn}>
                        ✕
                    </button>
                </div>

                {localError ? <div style={s.modalErrorText}>{localError}</div> : null}

                <label style={s.modalLabel}>Название</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={s.modalInput}
                />

                <label style={s.modalLabel}>Цена, ₽</label>
                <input
                    value={priceRubles}
                    onChange={(e) => setPriceRubles(e.target.value)}
                    style={s.modalInput}
                    inputMode="decimal"
                    placeholder="Например, 1500"
                />

                <label style={s.modalLabel}>Описание</label>
                <div style={s.modalDescriptionRow}>
                    <div style={s.modalDescriptionImageWrap}>
                        {croppedImageUrl ? (
                            <img src={croppedImageUrl} alt="preview" style={s.modalDescriptionImage} />
                        ) : (
                            <div style={s.modalDescriptionImagePlaceholder} />
                        )}

                        <div style={s.modalImageActions}>
                            <button type="button" onClick={openPicker} style={s.modalIconBtn}>
                                🔍
                            </button>

                            <button
                                type="button"
                                onClick={clearAllImage}
                                style={s.modalIconBtn}
                                disabled={!croppedImageUrl}
                            >
                                🗑
                            </button>
                        </div>

                        <input
                            ref={inputRef}
                            type="file"
                            accept={accept}
                            onChange={onChange}
                            style={{ display: "none" }}
                        />
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={s.modalDescriptionTextarea}
                    />
                </div>

                <div style={s.modalButtonsRow}>
                    <button type="button" onClick={onCancel} style={s.modalBtn}>
                        Отменить
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        style={{ ...s.modalBtn, ...s.modalBtnPrimary }}
                    >
                        Сохранить
                    </button>
                </div>

                <ImageCropModal
                    open={cropOpen}
                    src={cropSrc}
                    onCancel={clearPickerOnly}
                    onSave={async (url) => {
                        setCroppedImageUrl(url);
                        setCropOpen(false);
                        setCropSrc(null);
                    }}
                />
            </div>
        </div>
    );
}
