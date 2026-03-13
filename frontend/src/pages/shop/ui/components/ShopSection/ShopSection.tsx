import { ShopItemCard } from "../ShopItemCard/ShopItemCard";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";
import type { ShopCatalogItemDto, ShopProductCategory } from "../../../model/shop.types";

type ShopSectionProps = {
    title: string;
    category: ShopProductCategory;
    items: ShopCatalogItemDto[];
    onItemClick?: (item: ShopCatalogItemDto) => void;
};

export function ShopSection({
                                title,
                                category,
                                items,
                                onItemClick,
                            }: ShopSectionProps) {
    const sectionItems = items.filter((x) => x.category === category);

    if (sectionItems.length === 0) return null;

    return (
        <section>
            <div style={s.sectionTitle}>{title}</div>

            <div style={s.itemsGrid}>
                {sectionItems.map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                    />
                ))}
            </div>
        </section>
    );
}
