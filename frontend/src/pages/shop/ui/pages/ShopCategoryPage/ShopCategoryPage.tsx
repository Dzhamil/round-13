// frontend/src/pages/shop/ui/pages/ShopCategoryPage/ShopCategoryPage.tsx
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { ShopItemCard } from "../../components";
import type { BackNavigationState } from "../../../../../shared/lib/navigation";
import { shopCategoryPageStyles as s } from "./ShopCategoryPage.styles";

const SHOP_PATH = "/shop";

export function ShopCategoryPage() {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const { categoryId } = useParams<{ categoryId: string }>();

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
            {isAdmin && (
                <button
                    type="button"
                    style={s.adminAddItemBtn}
                    onClick={() => {
                        // далее подключим модалку
                        alert("TODO: Новый товар");
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
        </div>
    );
}
