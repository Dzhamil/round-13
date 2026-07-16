import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    createShopProduct,
    deleteShopProduct,
    updateShopProduct,
    type ShopCatalogItemDto,
    type ShopEntitlementType,
    type UpsertShopProductRequest,
} from "../../../api/product.api";
import {
    AdminPurchaseHistory,
    CategoryGrid,
    ProductDeleteModal,
    ProductDetailsModal,
    ProductEditModal,
    PurchaseHistory,
    PurchaseRequestsList,
    ShopItemCard,
} from "../../components";
import { ShopActionError } from "../../components/ShopActionError/ShopActionError";
import { ShopCategoryModals } from "../ShopCategoryModals/ShopCategoryModals";
import { useAdminShopOrderHistory } from "../../../model/useAdminShopOrderHistory";
import { useShopCategories } from "../../../model/useShopCategories";
import { useShopProducts } from "../../../model/useShopProducts";
import { useIsAdmin } from "../../../model/useIsAdmin";
import { useCategoryModals } from "../../../model/useCategoryModals";
import { usePendingPurchaseRequests } from "../../../model/usePendingPurchaseRequests";
import { extractShopErrorMessage } from "../../../model/shopError";
import { shopPageViewStyles as s } from "./ShopPageView.styles";

type ShopTab = "TRAININGS" | "MERCH" | "REQUESTS";
type RequestsView = "PENDING" | "HISTORY";
type TrainingType = ShopEntitlementType;

const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
    GROUP_TRAININGS: "Групповые",
    PERSONAL_TRAININGS: "Персональные",
};

function isTrainingEntitlement(type: ShopCatalogItemDto["entitlementType"]): type is TrainingType {
    return type === "GROUP_TRAININGS" || type === "PERSONAL_TRAININGS";
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
        defaultCategoryType,
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
    const [selectedProduct, setSelectedProduct] = useState<ShopCatalogItemDto | null>(null);
    const [productDetailsOpen, setProductDetailsOpen] = useState(false);
    const [productEditOpen, setProductEditOpen] = useState(false);
    const [productDeleteOpen, setProductDeleteOpen] = useState(false);

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
    const merchCategoryIds = new Set(merchCategories.map((category) => category.id));
    const trainingCategories = categories.filter((category) => category.type === "TRAININGS");
    const trainingCategoryIds = new Set(trainingCategories.map((category) => category.id));
    const defaultTrainingCategory = trainingCategories[0] ?? null;
    const trainingProducts = items.filter((item) =>
        trainingCategoryIds.has(item.categoryId) || isTrainingEntitlement(item.entitlementType)
    );
    const visibleTrainingProducts = trainingProducts.filter((item) => item.entitlementType === trainingType);
    const merchItems = items.filter((item) =>
        merchCategoryIds.has(item.categoryId) && !isTrainingEntitlement(item.entitlementType)
    );
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
    const openProductDetails = (product: ShopCatalogItemDto) => {
        setActionError(null);
        setSelectedProduct(product);
        setProductEditOpen(false);
        setProductDeleteOpen(false);
        setProductDetailsOpen(true);
    };
    const openProductCreate = () => {
        setActionError(null);
        setSelectedProduct(null);
        setProductDetailsOpen(false);
        setProductDeleteOpen(false);
        setProductEditOpen(true);
    };
    const openProductEdit = (product: ShopCatalogItemDto) => {
        setActionError(null);
        setSelectedProduct(product);
        setProductDetailsOpen(false);
        setProductDeleteOpen(false);
        setProductEditOpen(true);
    };
    const openProductDelete = (product: ShopCatalogItemDto) => {
        setActionError(null);
        setSelectedProduct(product);
        setProductDetailsOpen(false);
        setProductEditOpen(false);
        setProductDeleteOpen(true);
    };
    const closeProductDetails = () => {
        setProductDetailsOpen(false);
        setSelectedProduct(null);
    };
    const productModalCategory = selectedProduct
        ? categories.find((category) => category.id === selectedProduct.categoryId)
        : defaultTrainingCategory;

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
                    {activeTab === "MERCH" && isAdmin && (
                        <button
                            type="button"
                            style={s.adminAddCategoryBtn}
                            onClick={() => {
                                setActionError(null);
                                openAddCategory("MERCH");
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
                                                items={merchItems}
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
                                                onClick={() => {
                                                    setTrainingType(type);
                                                    setActionError(null);
                                                }}
                                            >
                                                {TRAINING_TYPE_LABELS[type]}
                                            </button>
                                        ))}
                                    </div>

                                    {isAdmin ? (
                                        <div style={s.trainingAdminActions}>
                                            {defaultTrainingCategory ? (
                                                <button
                                                    type="button"
                                                    style={s.adminAddCategoryBtn}
                                                    onClick={openProductCreate}
                                                >
                                                    + Добавить позицию
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    style={s.adminAddCategoryBtn}
                                                    onClick={() => {
                                                        setActionError(null);
                                                        openAddCategory("TRAININGS");
                                                    }}
                                                >
                                                    + Создать раздел тренировок
                                                </button>
                                            )}
                                        </div>
                                    ) : null}

                                    {visibleTrainingProducts.length > 0 ? (
                                        <div style={s.trainingProductsGrid}>
                                            {visibleTrainingProducts.map((product) => (
                                                <ShopItemCard
                                                    key={product.id}
                                                    item={product}
                                                    isAdmin={isAdmin}
                                                    onClick={() => openProductDetails(product)}
                                                    onBuy={() => openProductDetails(product)}
                                                    onDetails={() => openProductDetails(product)}
                                                    onEdit={() => openProductEdit(product)}
                                                    onDelete={() => openProductDelete(product)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={s.trainingEmpty}>
                                            {isAdmin && defaultTrainingCategory
                                                ? "В этом разделе пока нет позиций. Добавьте первую позицию каталога."
                                                : "Доступных позиций пока нет."}
                                        </div>
                                    )}
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
                defaultCategoryType={defaultCategoryType}
                onCancelEdit={closeEdit}
                deleteOpen={deleteOpen}
                deleteId={deleteId}
                onCancelDelete={closeDelete}
                reloadAll={reloadAll}
                setActionError={setActionError}
            />

            {productModalCategory ? (
                <ProductEditModal
                    open={productEditOpen}
                    categoryId={productModalCategory.id}
                    categoryType={productModalCategory.type}
                    categoryTitle={productModalCategory.title}
                    defaultEntitlementType={trainingType}
                    product={selectedProduct}
                    onCancel={() => {
                        setProductEditOpen(false);
                        setSelectedProduct(null);
                    }}
                    onSave={async (data: UpsertShopProductRequest) => {
                        try {
                            if (selectedProduct) {
                                await updateShopProduct(selectedProduct.id, data);
                            } else {
                                await createShopProduct(data);
                            }
                            await reloadAll();
                            setActionError(null);
                            setProductEditOpen(false);
                            setProductDetailsOpen(false);
                            setSelectedProduct(null);
                        } catch (err: unknown) {
                            setActionError(extractShopErrorMessage(err, "Ошибка при сохранении товара"));
                        }
                    }}
                />
            ) : null}

            <ProductDetailsModal
                open={productDetailsOpen}
                item={selectedProduct}
                isAdmin={isAdmin}
                onClose={closeProductDetails}
                onEdit={() => {
                    if (selectedProduct) {
                        openProductEdit(selectedProduct);
                    }
                }}
                onDelete={() => {
                    if (selectedProduct) {
                        openProductDelete(selectedProduct);
                    }
                }}
                onOrderCreated={reloadAdminOrders}
            />

            <ProductDeleteModal
                open={productDeleteOpen}
                productTitle={selectedProduct?.title ?? null}
                onCancel={() => {
                    setProductDeleteOpen(false);
                    setSelectedProduct(null);
                }}
                onConfirm={async () => {
                    if (!selectedProduct) return;
                    try {
                        await deleteShopProduct(selectedProduct.id);
                        await reloadAll();
                        setActionError(null);
                        setProductDeleteOpen(false);
                        setSelectedProduct(null);
                    } catch (err: unknown) {
                        setActionError(extractShopErrorMessage(err, "Ошибка при удалении товара"));
                    }
                }}
            />
        </div>
    );
}
