// frontend/src/pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage.tsx
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { createShopProduct, type UpsertShopProductRequest } from "../../../api/product.api";
import { ProductEditModal, ShopItemCard } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import type { BackNavigationState } from "../../../../../shared/lib/navigation";
import { shopCategoryPageStyles as s } from "./ShopCategoryPage.styles";

const SHOP_PATH = "/shop";

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object" && "message" in err) {
        const msg = (err as { message?: unknown }).message;
        if (typeof msg === "string" && msg.trim().length > 0) return msg;
    }
    return fallback;
}

export function ShopCategoryPage() {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const { categoryId } = useParams<{ categoryId: string }>();
    const [productModalOpen, setProductModalOpen] = useState(false);
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

    const openItem = (code: string) => {
        const state: BackNavigationState = {
            backTo: `/shop/category/${categoryId}`,
        };

        navigate(`/shop/${code}`, { state });
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
                            onClick={() => openItem(item.code)}
                        />
                    ))}
                </div>
            )}

            <ProductEditModal
                open={productModalOpen}
                categoryId={categoryId}
                onCancel={() => setProductModalOpen(false)}
                onSave={async (data: UpsertShopProductRequest) => {
                    try {
                        await createShopProduct(data);
                        await reload();
                        setProductModalOpen(false);
                    } catch (err: unknown) {
                        setActionError(getErrorMessage(err, "Ошибка при сохранении товара"));
                    }
                }}
            />
        </div>
    );
}
