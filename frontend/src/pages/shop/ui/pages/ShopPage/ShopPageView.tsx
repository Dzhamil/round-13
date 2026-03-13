import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryGrid } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { ShopCategoryModals } from "../ShopCategoryModals/ShopCategoryModals";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { useCategoryModals } from "../../../model/useCategoryModals";
import { shopPageViewStyles as s } from "./ShopPageView.styles";

export function ShopPageView() {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();

    const { categories, loading: catLoading, error: catError, reload: reloadCats } = useShopCategories();
    const { items, loading: prodLoading, error: prodError, reload: reloadProds } = useShopProducts();

    const {
        editOpen,
        editCategory,
        deleteOpen,
        deleteId,
        openAddCategory,
        openEditCategory,
        openDeleteCategory,
        closeEdit,
        closeDelete,
    } = useCategoryModals();

    const [actionError, setActionError] = useState<string | null>(null);

    const reloadAll = async () => {
        await Promise.all([reloadCats(), reloadProds()]);
    };

    const openCategory = (id: string) => navigate(`/shop/category/${id}`);

    if (catLoading || prodLoading) return <div style={s.page}>Загрузка магазина…</div>;

    if (catError || prodError) {
        return (
            <div style={s.page}>
                <p style={s.subtitle}>{catError ?? prodError}</p>
                <button type="button" onClick={() => void reloadAll()} style={s.backButton}>
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
                    style={s.adminAddCategoryBtn}
                    onClick={() => {
                        setActionError(null);
                        openAddCategory();
                    }}
                >
                    + Добавить категорию
                </button>
            )}

            <div style={s.categoriesWrap}>
                <CategoryGrid
                    categories={categories}
                    items={items}
                    isAdmin={isAdmin}
                    onOpenCategory={openCategory}
                    onEditCategory={(cat) => {
                        setActionError(null);
                        openEditCategory(cat);
                    }}
                    onDeleteCategory={(id) => {
                        setActionError(null);
                        openDeleteCategory(id);
                    }}
                />
            </div>

            <ShopCategoryModals
                editOpen={editOpen}
                editCategory={editCategory}
                onCancelEdit={closeEdit}
                deleteOpen={deleteOpen}
                deleteId={deleteId}
                onCancelDelete={closeDelete}
                reloadAll={reloadAll}
                setActionError={setActionError}
            />
        </div>
    );
}