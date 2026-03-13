// frontend/src/pages/shop/ui/pages/ShopCategoryModals.tsx
import type { ShopCategoryResponse, UpsertShopCategoryRequest } from "../../../api/category.api";
import { createShopCategory, deleteShopCategory, updateShopCategory } from "../../../api/category.api";
import { CategoryDeleteModal, CategoryEditModal } from "../../components";

type Props = {
    editOpen: boolean;
    editCategory: ShopCategoryResponse | null;
    onCancelEdit: () => void;

    deleteOpen: boolean;
    deleteId: string | null;
    onCancelDelete: () => void;

    reloadAll: () => Promise<void>;
    setActionError: (msg: string | null) => void;
};

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object" && "message" in err) {
        const msg = (err as { message?: unknown }).message;
        if (typeof msg === "string" && msg.trim().length > 0) return msg;
    }
    return fallback;
}

export function ShopCategoryModals(props: Props) {
    const {
        editOpen,
        editCategory,
        onCancelEdit,
        deleteOpen,
        deleteId,
        onCancelDelete,
        reloadAll,
        setActionError,
    } = props;

    const onSave = async (data: UpsertShopCategoryRequest) => {
        try {
            if (editCategory) await updateShopCategory(editCategory.id, data);
            else await createShopCategory(data);

            await reloadAll();
            onCancelEdit();
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Ошибка при сохранении категории"));
        }
    };

    const onConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteShopCategory(deleteId);
            await reloadAll();
            onCancelDelete();
        } catch (err: unknown) {
            setActionError(getErrorMessage(err, "Ошибка при удалении категории"));
        }
    };

    return (
        <>
            <CategoryEditModal
                open={editOpen}
                category={editCategory}
                onCancel={onCancelEdit}
                onSave={onSave}
            />
            <CategoryDeleteModal
                open={deleteOpen}
                categoryId={deleteId}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
            />
        </>
    );
}