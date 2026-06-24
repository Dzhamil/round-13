import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { AdminPurchaseHistory, CategoryGrid, ProductDetailsModal, PurchaseHistory, PurchaseRequestsList, ShopItemCard } from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { ModalShell } from "../../components/ModalShell/ModalShell";
import { ShopCategoryModals } from "../ShopCategoryModals/ShopCategoryModals";
import { useAdminShopOrderHistory } from "../../../model/useAdminShopOrderHistory";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { useCategoryModals } from "../../../model/useCategoryModals";
import { usePendingPurchaseRequests } from "../../../model/usePendingPurchaseRequests";
import { shopPageViewStyles as s } from "./ShopPageView.styles";

type ShopTab = "TRAININGS" | "MERCH" | "REQUESTS";
type RequestsView = "PENDING" | "HISTORY";
type TrainingType = "GROUP_TRAININGS" | "PERSONAL_TRAININGS";

const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
    GROUP_TRAININGS: "Групповые",
    PERSONAL_TRAININGS: "Персональные",
};

const TRAINING_TYPE_TITLES: Record<TrainingType, string> = {
    GROUP_TRAININGS: "Групповые тренировки",
    PERSONAL_TRAININGS: "Персональные тренировки",
};

const GROUP_TRAINING_OPTIONS = [
    "Группа пн, ср, пт - 19:00",
    "Группа пн, ср, пт - 20:00",
    "Группа вт, чт - 19:00; сб - 11:00",
    "Дет. группа 12-16 лет - пн, ср, пт - 17:30",
    "Дет. группа 7-11 лет - пн, ср, пт - 16:00",
] as const;

const PERSONAL_TRAINING_OPTIONS = [
    "Тариф - База",
    "Тариф - ПРО",
    "Тариф - Премиум",
    "Тариф - VIP",
] as const;

type TrainingOptionSelection = {
    type: TrainingType;
    label?: string;
};

function normalizeSearchValue(value: string): string {
    return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

function productMatchesTrainingSelection(
    product: ShopCatalogItemDto,
    selection: TrainingOptionSelection
): boolean {
    if (product.entitlementType !== selection.type) {
        return false;
    }

    if (!selection.label) {
        return true;
    }

    const option = normalizeSearchValue(selection.label);
    const title = normalizeSearchValue(product.title);
    const categoryTitle = normalizeSearchValue(product.categoryTitle);

    return title.includes(option) || categoryTitle.includes(option);
}

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
    const [trainingType, setTrainingType] = useState<TrainingType>("GROUP_TRAININGS");
    const [requestsView, setRequestsView] = useState<RequestsView>("PENDING");
    const [trainingSelection, setTrainingSelection] = useState<TrainingOptionSelection | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ShopCatalogItemDto | null>(null);
    const [productDetailsOpen, setProductDetailsOpen] = useState(false);

    const currentTab = searchParams.get("tab");
    const activeTab: ShopTab =
        currentTab === "merch"
            ? "MERCH"
            : currentTab === "requests" || currentTab === "history"
            ? "REQUESTS"
            : "TRAININGS";
    const activeRequestsView: RequestsView =
        currentTab === "history" && isAdmin ? "HISTORY" : requestsView;

    const reloadAll = async () => {
        await Promise.all([reloadCats(), reloadProds()]);
    };

    const openCategory = (id: string) => navigate(`/shop/category/${id}`);
    const catalogLoading = catLoading || prodLoading;
    const catalogError = catError ?? prodError;
    const merchCategories = categories.filter((category) => category.type === "MERCH");
    const trainingCategories = categories.filter((category) => category.type === "TRAININGS");
    const trainingCategoryIds = new Set(trainingCategories.map((category) => category.id));
    const trainingProducts = items.filter((item) => trainingCategoryIds.has(item.categoryId));
    const selectedTrainingProducts = getTrainingProductsForSelection(trainingProducts, trainingSelection);
    const activeTrainingOptions =
        trainingType === "GROUP_TRAININGS" ? GROUP_TRAINING_OPTIONS : PERSONAL_TRAINING_OPTIONS;
    const requestsTabLabel = "Заявки";

    const switchTab = (tab: ShopTab) => {
        const next = new URLSearchParams(searchParams);
        if (tab === "TRAININGS") {
            next.delete("tab");
        } else if (tab === "MERCH") {
            next.set("tab", "merch");
        } else {
            next.set("tab", "requests");
            setRequestsView("PENDING");
        }
        setTrainingSelection(null);
        setSearchParams(next, { replace: true });
    };
    const switchRequestsView = (view: RequestsView) => {
        const next = new URLSearchParams(searchParams);
        next.set("tab", view === "HISTORY" ? "history" : "requests");
        setRequestsView(view);
        setSearchParams(next, { replace: true });
    };
    const reloadAdminOrders = async () => {
        await Promise.all([reloadPendingRequests(), reloadAdminOrderHistory()]);
    };
    const openTrainingWindow = (selection: TrainingOptionSelection) => {
        setTrainingType(selection.type);
        setTrainingSelection(selection);
    };
    const openProductDetails = (product: ShopCatalogItemDto) => {
        setSelectedProduct(product);
        setProductDetailsOpen(true);
    };
    const closeProductDetails = () => {
        setProductDetailsOpen(false);
        setSelectedProduct(null);
    };
    const closeTrainingWindow = () => {
        setTrainingSelection(null);
    };

    return (
        <div style={s.page}>
            <ShopActionError message={actionError} />

            <div style={s.tabsWrap}>
                <button
                    type="button"
                    style={s.tab(activeTab === "TRAININGS")}
                    onClick={() => switchTab("TRAININGS")}
                >
                    <span style={s.tabInner}>Тренировки</span>
                </button>
                <button
                    type="button"
                    style={s.tab(activeTab === "MERCH")}
                    onClick={() => switchTab("MERCH")}
                >
                    <span style={s.tabInner}>Мерч</span>
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
            </div>

            {activeTab === "TRAININGS" || activeTab === "MERCH" ? (
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
                            {activeTab === "MERCH" ? (
                                merchCategories.length > 0 ? (
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
                                ) : (
                                    <div style={s.subtitle}>Категорий мерча пока нет.</div>
                                )
                            ) : (
                                <>
                                    <div style={s.trainingHeader}>
                                        {(["GROUP_TRAININGS", "PERSONAL_TRAININGS"] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                style={s.trainingTypeButton(trainingType === type)}
                                                onClick={() => setTrainingType(type)}
                                            >
                                                {TRAINING_TYPE_LABELS[type]}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={s.trainingOptionsGrid}>
                                        {activeTrainingOptions.map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                style={s.trainingOptionCard}
                                                onClick={() => openTrainingWindow({ type: trainingType, label })}
                                            >
                                                <span style={s.trainingOptionTitle}>{label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {isAdmin && trainingCategories.length > 0 ? (
                                        <section style={s.adminTrainingSection}>
                                            <div style={s.sectionTitle}>Категории тренировок</div>
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
                                </>
                            )}

                            {merchCategories.length === 0 && trainingCategories.length === 0 ? (
                                <div style={s.subtitle}>Категорий пока нет.</div>
                            ) : null}
                        </div>
                    ) : null}
                </>
            ) : activeTab === "REQUESTS" && isAdmin ? (
                <>
                    <div style={s.requestSubTabs}>
                        <button
                            type="button"
                            style={s.requestSubTab(activeRequestsView === "PENDING")}
                            onClick={() => switchRequestsView("PENDING")}
                        >
                            Активные
                        </button>
                        <button
                            type="button"
                            style={s.requestSubTab(activeRequestsView === "HISTORY")}
                            onClick={() => switchRequestsView("HISTORY")}
                        >
                            История
                        </button>
                    </div>
                    {activeRequestsView === "PENDING" ? (
                        <PurchaseRequestsList
                            items={pendingRequests}
                            loading={pendingLoading}
                            error={pendingError}
                            reload={reloadPendingRequests}
                            onStatusUpdated={reloadAdminOrders}
                        />
                    ) : (
                        <AdminPurchaseHistory
                            items={adminOrderHistory}
                            loading={historyLoading}
                            error={historyError}
                            reload={reloadAdminOrderHistory}
                        />
                    )}
                </>
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

            {trainingSelection ? (
                <ModalShell onClose={closeTrainingWindow}>
                    <div style={s.trainingModalCard} onMouseDown={(event) => event.stopPropagation()}>
                        <div style={s.trainingModalHeader}>
                            <div>
                                <div style={s.trainingModalTitle}>
                                    {trainingSelection.label ?? TRAINING_TYPE_TITLES[trainingSelection.type]}
                                </div>
                                {trainingSelection.label ? (
                                    <div style={s.trainingModalSubtitle}>
                                        {TRAINING_TYPE_TITLES[trainingSelection.type]}
                                    </div>
                                ) : null}
                            </div>
                            <button type="button" onClick={closeTrainingWindow} style={s.trainingModalClose}>
                                ✕
                            </button>
                        </div>

                        {selectedTrainingProducts.length > 0 ? (
                            <div style={s.trainingModalProducts}>
                                {selectedTrainingProducts.map((product) => (
                                    <ShopItemCard
                                        key={product.id}
                                        item={product}
                                        isAdmin={false}
                                        onClick={() => openProductDetails(product)}
                                        onBuy={() => openProductDetails(product)}
                                        onDetails={() => openProductDetails(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={s.trainingModalEmpty}>
                                Доступных вариантов для этого выбора пока нет.
                            </div>
                        )}
                    </div>
                </ModalShell>
            ) : null}

            <ProductDetailsModal
                open={productDetailsOpen}
                item={selectedProduct}
                isAdmin={false}
                onClose={closeProductDetails}
                onOrderCreated={reloadAdminOrders}
            />
        </div>
    );
}

function getTrainingProductsForSelection(
    products: ShopCatalogItemDto[],
    selection: TrainingOptionSelection | null
): ShopCatalogItemDto[] {
    if (!selection) {
        return [];
    }

    const productsByType = products.filter((product) => product.entitlementType === selection.type);

    if (!selection.label) {
        return productsByType;
    }

    const exactProducts = productsByType.filter((product) =>
        productMatchesTrainingSelection(product, selection)
    );

    return exactProducts.length > 0 ? exactProducts : productsByType;
}
