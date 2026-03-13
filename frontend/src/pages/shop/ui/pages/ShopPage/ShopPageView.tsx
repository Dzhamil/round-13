import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminPurchaseHistory, CategoryGrid, PurchaseHistory, PurchaseRequestsList } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { ShopCategoryModals } from "../ShopCategoryModals/ShopCategoryModals";
import { useAdminShopOrderHistory } from "../../../model/useAdminShopOrderHistory";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { useCategoryModals } from "../../../model/useCategoryModals";
import { usePendingPurchaseRequests } from "../../../model/usePendingPurchaseRequests";
import { shopPageViewStyles as s } from "./ShopPageView.styles";

type ShopTab = "CATALOG" | "REQUESTS";
type AdminShopTab = ShopTab | "HISTORY";

export function ShopPageView() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isAdmin = useIsAdmin();
    const {
        items: pendingRequests,
        loading: pendingLoading,
        error: pendingError,
        reload: reloadPendingRequests,
        hasNewRequests,
    } = usePendingPurchaseRequests({ enabled: isAdmin });
    const {
        items: adminOrderHistory,
        loading: historyLoading,
        error: historyError,
        reload: reloadAdminOrderHistory,
    } = useAdminShopOrderHistory({ enabled: isAdmin });

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
    const activeTab: AdminShopTab =
        currentTab === "requests"
            ? "REQUESTS"
            : currentTab === "history" && isAdmin
                ? "HISTORY"
                : "CATALOG";

    const reloadAll = async () => {
        await Promise.all([reloadCats(), reloadProds()]);
    };

    const openCategory = (id: string) => navigate(`/shop/category/${id}`);
    const catalogLoading = catLoading || prodLoading;
    const catalogError = catError ?? prodError;
    const merchCategories = categories.filter((category) => category.type === "MERCH");
    const trainingCategories = categories.filter((category) => category.type === "TRAININGS");
    const requestsTabLabel = "Заявки";

    const switchTab = (tab: AdminShopTab) => {
        const next = new URLSearchParams(searchParams);
        if (tab === "CATALOG") {
            next.delete("tab");
        } else if (tab === "REQUESTS") {
            next.set("tab", "requests");
        } else {
            next.set("tab", "history");
        }
        setSearchParams(next, { replace: true });
    };
    const reloadAdminOrders = async () => {
        await Promise.all([reloadPendingRequests(), reloadAdminOrderHistory()]);
    };

    return (
        <div style={s.page}>
            <ShopActionError message={actionError} />

            <div style={s.tabsWrap}>
                <button
                    type="button"
                    style={s.tab(activeTab === "CATALOG")}
                    onClick={() => switchTab("CATALOG")}
                >
                    <span style={s.tabInner}>Каталог</span>
                </button>
                <button
                    type="button"
                    style={s.tab(activeTab === "REQUESTS")}
                    onClick={() => switchTab("REQUESTS")}
                >
                    <span style={s.tabInner}>
                        <span>{requestsTabLabel}</span>
                        {isAdmin && hasNewRequests ? <span style={s.tabBadge} /> : null}
                    </span>
                </button>
                {isAdmin ? (
                    <button
                        type="button"
                        style={s.tab(activeTab === "HISTORY")}
                        onClick={() => switchTab("HISTORY")}
                    >
                        <span style={s.tabInner}>История</span>
                    </button>
                ) : null}
            </div>

            {activeTab === "CATALOG" ? (
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

                    {catalogLoading ? <div>Загрузка магазина…</div> : null}

                    {catalogError ? (
                        <div>
                            <p style={s.subtitle}>{catalogError}</p>
                            <button type="button" onClick={() => void reloadAll()} style={s.backButton}>
                                Повторить
                            </button>
                        </div>
                    ) : null}

                    {!catalogLoading && !catalogError ? (
                        <div style={s.categoriesWrap}>
                            {merchCategories.length > 0 ? (
                                <section>
                                    <div style={s.sectionTitle}>Мерч</div>
                                    <CategoryGrid
                                        categories={merchCategories}
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
                                </section>
                            ) : null}

                            {trainingCategories.length > 0 ? (
                                <section>
                                    <div style={s.sectionTitle}>Тренировки</div>
                                    <CategoryGrid
                                        categories={trainingCategories}
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
                                </section>
                            ) : null}

                            {merchCategories.length === 0 && trainingCategories.length === 0 ? (
                                <div style={s.subtitle}>Категорий пока нет.</div>
                            ) : null}
                        </div>
                    ) : null}
                </>
            ) : activeTab === "REQUESTS" && isAdmin ? (
                <>
                    <PurchaseRequestsList
                        items={pendingRequests}
                        loading={pendingLoading}
                        error={pendingError}
                        reload={reloadPendingRequests}
                        onStatusUpdated={reloadAdminOrders}
                    />
                </>
            ) : activeTab === "HISTORY" && isAdmin ? (
                <AdminPurchaseHistory
                    items={adminOrderHistory}
                    loading={historyLoading}
                    error={historyError}
                    reload={reloadAdminOrderHistory}
                />
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
