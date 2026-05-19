// frontend/src/pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage.tsx
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { extractShopErrorMessage } from "../../../model/shopError";
import { SHOP_PATH } from "../../../model/shop.constants";
import { GROUP_TRAINING_EMPTY_STATE, isGroupTrainingCategory } from "../../../model/groupTrainingCategory";
import {
    createShopProduct,
    deleteShopProduct,
    updateShopProduct,
    type ShopCatalogItemDto,
    type UpsertShopProductRequest,
} from "../../../api/product.api";
import { ProductDeleteModal, ProductDetailsModal, ProductEditModal, ShopItemCard } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { shopCategoryPageStyles as s } from "./ShopCategoryPage.styles";

export function ShopCategoryPage() {
    const isAdmin = useIsAdmin();
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ShopCatalogItemDto | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const { categories, loading: loadingCats } = useShopCategories();
    const { items, loading: loadingProds, error, reload } =
        useShopProducts(categoryId);

    if (!categoryId) return <Navigate to={SHOP_PATH} replace />;

    if (loadingCats || loadingProds) {
        return <div style={s.page}>Загрузка категории…</div>;
    }

    const categoryMeta = categories.find((c) => c.id === categoryId);
    if (!categoryMeta) return <Navigate to={SHOP_PATH} replace />;
    const isGroupTraining = isGroupTrainingCategory(categoryMeta);

    const openItem = (item: ShopCatalogItemDto) => {
        setActionError(null);
        setSelectedItem(item);
        setDetailsOpen(true);
    };
    const goBackToShop = () => navigate(SHOP_PATH);

    if (error) {
        return (
            <div style={s.page}>
                <p style={s.subtitle}>{error}</p>
                <button type="button" onClick={() => void reload()} style={s.retryBtn}>
                    Повторить
                </button>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <ShopActionError message={actionError} />

            <section style={s.categoryHeader}>
                <h1 style={s.categoryTitle}>{categoryMeta.title}</h1>
                {categoryMeta.description.trim() ? (
                    <p style={s.categoryDescription}>{categoryMeta.description}</p>
                ) : null}
            </section>

            {isAdmin && (
                <button
                    type="button"
                    style={s.adminAddItemBtn}
                    onClick={() => {
                        setActionError(null);
                        setSelectedItem(null);
                        setProductModalOpen(true);
                    }}
                >
                    + Новый товар
                </button>
            )}

            {items.length === 0 && isGroupTraining ? (
                <section style={s.emptyState}>
                    <h1 style={s.emptyTitle}>{GROUP_TRAINING_EMPTY_STATE.title}</h1>
                    <p style={s.emptyText}>{GROUP_TRAINING_EMPTY_STATE.body}</p>
                    {isAdmin ? (
                        <p style={s.adminHint}>{GROUP_TRAINING_EMPTY_STATE.adminHint}</p>
                    ) : null}
                    <button type="button" onClick={goBackToShop} style={s.emptyActionButton}>
                        {GROUP_TRAINING_EMPTY_STATE.actionLabel}
                    </button>
                </section>
            ) : items.length === 0 ? (
                <section style={s.emptyState}>
                    <p style={s.emptyText}>В этой категории пока нет товаров.</p>
                    <button type="button" onClick={goBackToShop} style={s.emptyActionButton}>
                        Назад в магазин
                    </button>
                </section>
            ) : (
                <div style={s.itemsGrid}>
                    {items.map((item) => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onClick={() => openItem(item)}
                        />
                    ))}
                </div>
            )}

            <ProductEditModal
                open={productModalOpen}
                categoryId={categoryId}
                categoryType={categoryMeta.type}
                categoryTitle={categoryMeta.title}
                product={selectedItem}
                onCancel={() => {
                    setProductModalOpen(false);
                    setSelectedItem(null);
                }}
                onSave={async (data: UpsertShopProductRequest) => {
                    try {
                        if (selectedItem) {
                            await updateShopProduct(selectedItem.id, data);
                        } else {
                            await createShopProduct(data);
                        }
                        await reload();
                        setProductModalOpen(false);
                        setDetailsOpen(false);
                        setSelectedItem(null);
                    } catch (err: unknown) {
                        setActionError(extractShopErrorMessage(err, "Ошибка при сохранении товара"));
                    }
                }}
            />

            <ProductDetailsModal
                open={detailsOpen}
                item={selectedItem}
                isAdmin={isAdmin}
                onClose={() => {
                    setDetailsOpen(false);
                    setSelectedItem(null);
                }}
                onEdit={() => {
                    setDetailsOpen(false);
                    setProductModalOpen(true);
                }}
                onDelete={() => {
                    setDetailsOpen(false);
                    setDeleteOpen(true);
                }}
            />

            <ProductDeleteModal
                open={deleteOpen}
                productTitle={selectedItem?.title ?? null}
                onCancel={() => {
                    setDeleteOpen(false);
                    setSelectedItem(null);
                }}
                onConfirm={async () => {
                    if (!selectedItem) return;
                    try {
                        await deleteShopProduct(selectedItem.id);
                        await reload();
                        setDeleteOpen(false);
                        setSelectedItem(null);
                    } catch (err: unknown) {
                        setActionError(extractShopErrorMessage(err, "Ошибка при удалении товара"));
                    }
                }}
            />
        </div>
    );
}
