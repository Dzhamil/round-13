// frontend/src/pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage.tsx
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
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

const SHOP_PATH = "/shop";

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object") {
        if ("response" in err) {
            const response = (err as { response?: { data?: { message?: unknown } } }).response;
            const message = response?.data?.message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }
        if ("message" in err) {
            const msg = (err as { message?: unknown }).message;
            if (typeof msg === "string" && msg.trim().length > 0) return msg;
        }
    }
    return fallback;
}

export function ShopCategoryPage() {
    const isAdmin = useIsAdmin();
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

    const openItem = (item: ShopCatalogItemDto) => {
        setActionError(null);
        setSelectedItem(item);
        setDetailsOpen(true);
    };

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

            {items.length === 0 ? (
                <p style={s.subtitle}>
                    В этой категории пока нет товаров.
                </p>
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
                        setActionError(getErrorMessage(err, "Ошибка при сохранении товара"));
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
                        setActionError(getErrorMessage(err, "Ошибка при удалении товара"));
                    }
                }}
            />
        </div>
    );
}
