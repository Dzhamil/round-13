import type { ShopCategoryResponse } from "../../../api/category.api";
import type { ShopCatalogItemDto } from "../../../api/product.api";
import { getCategoryAvailabilityLabel } from "../../../model/groupTrainingCategory";
import { CategoryCard } from "../CategoryCard/CategoryCard";

type Props = {
    categories: ShopCategoryResponse[];
    items: ShopCatalogItemDto[];
    isAdmin?: boolean;

    onOpenCategory: (id: string) => void;
    onEditCategory?: (category: ShopCategoryResponse) => void;
    onDeleteCategory?: (id: string) => void;
};

export function CategoryGrid({
                                 categories,
                                 items,
                                 isAdmin = false,
                                 onOpenCategory,
                                 onEditCategory,
                                 onDeleteCategory,
                             }: Props) {
    return (
        <div style={{ display: "grid", gap: 12 }}>
            {categories.map((cat) => {
                const count = items.filter((x) => x.categoryId === cat.id).length;
                const availabilityLabel = getCategoryAvailabilityLabel(cat, count);

                return (
                    <CategoryCard
                        key={cat.id}
                        category={cat}
                        availabilityLabel={availabilityLabel}
                        isAdmin={isAdmin}
                        onOpen={() => onOpenCategory(cat.id)}
                        onEdit={() => onEditCategory?.(cat)}
                        onDelete={() => onDeleteCategory?.(cat.id)}
                    />
                );
            })}
        </div>
    );
}
