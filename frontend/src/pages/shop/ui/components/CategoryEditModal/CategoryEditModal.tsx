// frontend/src/pages/shop/ui/components/CategoryEditModal/CategoryEditModal.tsx
import { useEffect, useRef, useState } from "react";
import type { ShopCategoryResponse, UpsertShopCategoryRequest } from "../../../api/category.api";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";
import { useImageFilePicker } from "../../../model/useImageFilePicker";
import { ImageCropModal } from "../ImageCropModal/ImageCropModal";

type Props = {
    open: boolean;
    category: ShopCategoryResponse | null;
    onCancel: () => void;
    onSave: (data: UpsertShopCategoryRequest) => void | Promise<void>;
};

export function CategoryEditModal({ open, category, onCancel, onSave }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

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

        setTitle(category?.title ?? "");
        setDescription(category?.description ?? "");

        // ВАЖНО: при редактировании показываем текущую картинку категории
        setCroppedImageUrl(category?.previewImageUrl ?? "");

        // очищаем только выбранный файл/кроп (но не затираем previewImageUrl выше)
        clearPickerOnly();
    }, [open, category]);

    useEffect(() => {
        if (!open || !hasImage || !dataUrl) return;
        if (lastCropSrcRef.current === dataUrl) return;

        lastCropSrcRef.current = dataUrl;
        setCropSrc(dataUrl);
        setCropOpen(true);
        // пока кроп не сохранён — не трогаем текущую картинку
    }, [open, hasImage, dataUrl]);

    if (!open) return null;

    const handleSave = () => {
        const payload: UpsertShopCategoryRequest = {
            title: title.trim(),
            description: description.trim(),
            previewImageUrl: croppedImageUrl || undefined,
        };
        void onSave(payload);
    };

    return (
        <div style={s.modalOverlay}>
            <div style={s.modalCard}>
                <div style={s.modalHeaderRow}>
                    <div style={s.modalTitle}>{category ? "Редактировать категорию" : "Добавить категорию"}</div>
                    <button onClick={onCancel} style={s.modalCloseBtn}>
                        ✕
                    </button>
                </div>

                <label style={s.modalLabel}>Название</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={s.modalInput} />

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

                        <input ref={inputRef} type="file" accept={accept} onChange={onChange} style={{ display: "none" }} />
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={s.modalDescriptionTextarea}
                    />
                </div>

                <div style={s.modalButtonsRow}>
                    <button onClick={onCancel} style={s.modalBtn}>
                        Отменить
                    </button>
                    <button onClick={handleSave} style={{ ...s.modalBtn, ...s.modalBtnPrimary }}>
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