import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CategoryGrid, PurchaseHistory, PurchaseRequestsList } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { ShopCategoryModals } from "../ShopCategoryModals/ShopCategoryModals";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { useCategoryModals } from "../../../model/useCategoryModals";
import { shopPageViewStyles as s } from "./ShopPageView.styles";

type ShopTab = "MERCH" | "REQUESTS";

export function ShopPageView() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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

    const currentTab = searchParams.get("tab");
    const activeTab: ShopTab = currentTab === "requests" ? "REQUESTS" : "MERCH";

    const reloadAll = async () => {
        await Promise.all([reloadCats(), reloadProds()]);
    };

    const openCategory = (id: string) => navigate(`/shop/category/${id}`);
    const merchLoading = catLoading || prodLoading;
    const merchError = catError ?? prodError;
    const requestsTabLabel = isAdmin ? "Заявки участников" : "Мои заявки";

    const switchTab = (tab: ShopTab) => {
        const next = new URLSearchParams(searchParams);
        if (tab === "MERCH") {
            next.delete("tab");
        } else {
            next.set("tab", "requests");
        }
        setSearchParams(next, { replace: true });
    };

    return (
        <div style={s.page}>
            <ShopActionError message={actionError} />

            <div style={s.tabsWrap}>
                <button
                    type="button"
                    style={s.tab(activeTab === "MERCH")}
                    onClick={() => switchTab("MERCH")}
                >
                    Мерч
                </button>
                <button
                    type="button"
                    style={s.tab(activeTab === "REQUESTS")}
                    onClick={() => switchTab("REQUESTS")}
                >
                    {requestsTabLabel}
                </button>
            </div>

            {activeTab === "MERCH" ? (
                <>
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

                    {merchLoading ? <div>Загрузка магазина…</div> : null}

                    {merchError ? (
                        <div>
                            <p style={s.subtitle}>{merchError}</p>
                            <button type="button" onClick={() => void reloadAll()} style={s.backButton}>
                                Повторить
                            </button>
                        </div>
                    ) : null}

                    {!merchLoading && !merchError ? (
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
                    ) : null}
                </>
            ) : isAdmin ? (
                <PurchaseRequestsList />
            ) : (
                <PurchaseHistory />
            )}

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
