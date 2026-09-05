import { useEffect, useRef, useState } from "react";
import type { ShopEntitlementType, UpsertShopProductRequest } from "../../../api/product.api";
import { useImageFilePicker } from "../../../model/useImageFilePicker";
import { shopModalStyles as s } from "../../../styles/shopModal.styles";
import { ImageCropModal } from "../ImageCropModal/ImageCropModal";
import { getMembers } from "../../../../members/api/members.api";
import type { MemberListItem } from "../../../../members/model/members.types";
import { DEFAULT_TRAINING_ENTITLEMENT_TYPE, PRODUCT_EDIT_TEXT } from "./productEditModal.constants";
import {
    buildProductEditFormState,
    buildUpsertShopProductPayload,
    getTrainingProductAdminHint,
    validateProductEditForm,
} from "./productEditModal.helpers";
import { TrainingPackageFields } from "./TrainingPackageFields";

type Props = {
    open: boolean;
    categoryId: string;
    categoryType: "MERCH" | "TRAININGS";
    categoryTitle: string;
    defaultEntitlementType?: ShopEntitlementType;
    product?: UpsertShopProductRequest & { id?: string } | null;
    onCancel: () => void;
    onSave: (data: UpsertShopProductRequest) => void | Promise<void>;
};

export function ProductEditModal({
    open,
    categoryId,
    categoryType,
    categoryTitle,
    defaultEntitlementType = DEFAULT_TRAINING_ENTITLEMENT_TYPE,
    product,
    onCancel,
    onSave,
}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priceRubles, setPriceRubles] = useState("");
    const [entitlementType, setEntitlementType] = useState<ShopEntitlementType>(DEFAULT_TRAINING_ENTITLEMENT_TYPE);
    const [entitlementQuantity, setEntitlementQuantity] = useState("");
    const [trainerId, setTrainerId] = useState("");
    const [coaches, setCoaches] = useState<MemberListItem[]>([]);
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
        const nextState = buildProductEditFormState(product, defaultEntitlementType);
        setTitle(nextState.title);
        setDescription(nextState.description);
        setPriceRubles(nextState.priceRubles);
        setEntitlementType(nextState.entitlementType);
        setEntitlementQuantity(nextState.entitlementQuantity);
        setTrainerId(nextState.trainerId);
        setCroppedImageUrl(nextState.croppedImageUrl);
        setLocalError(null);
        clearPickerOnly();
    }, [open, categoryId, product, defaultEntitlementType]);

    useEffect(() => {
        if (!open || categoryType !== "TRAININGS") return;

        let active = true;
        getMembers("COACHES")
            .then((res) => {
                if (active) {
                    setCoaches(res.items);
                }
            })
            .catch(() => {
                if (active) {
                    setCoaches([]);
                }
            });

        return () => {
            active = false;
        };
    }, [open, categoryType]);

    useEffect(() => {
        if (!open || !hasImage || !dataUrl) return;
        if (lastCropSrcRef.current === dataUrl) return;

        lastCropSrcRef.current = dataUrl;
        setCropSrc(dataUrl);
        setCropOpen(true);
    }, [open, hasImage, dataUrl]);

    if (!open) return null;
    const isTrainingCategory = categoryType === "TRAININGS";
    const adminHint = getTrainingProductAdminHint(
        { entitlementType, entitlementQuantity },
        categoryType
    );

    const handleSave = () => {
        const validationError = validateProductEditForm(
            {
                title,
                description,
                priceRubles,
                entitlementType,
                entitlementQuantity,
                trainerId,
                croppedImageUrl,
            },
            categoryType
        );

        if (validationError) {
            setLocalError(validationError);
            return;
        }

        setLocalError(null);
        void onSave(buildUpsertShopProductPayload(
            {
                title,
                description,
                priceRubles,
                entitlementType,
                entitlementQuantity,
                trainerId,
                croppedImageUrl,
            },
            categoryId,
            categoryType
        ));
    };

    return (
        <div style={s.modalOverlay}>
            <div style={s.modalCard}>
                <div style={s.modalHeaderRow}>
                    <div style={s.modalTitle}>
                        {product ? PRODUCT_EDIT_TEXT.editTitle : PRODUCT_EDIT_TEXT.createTitle}
                    </div>
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
                    placeholder={PRODUCT_EDIT_TEXT.pricePlaceholder}
                />

                {isTrainingCategory ? (
                    <>
                        <TrainingPackageFields
                            entitlementType={entitlementType}
                            entitlementQuantity={entitlementQuantity}
                            trainerId={trainerId}
                            coaches={coaches}
                            onEntitlementTypeChange={setEntitlementType}
                            onEntitlementQuantityChange={setEntitlementQuantity}
                            onTrainerIdChange={setTrainerId}
                        />
                        {adminHint ? (
                            <div style={s.modalWarningText}>
                                {categoryTitle}: {adminHint}
                            </div>
                        ) : null}
                    </>
                ) : null}

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
