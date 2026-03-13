import type { ShopCategoryMeta } from "../../../model/shop.constants";
import type { ShopProductCategory } from "../../../model/shop.types";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    categories: ShopCategoryMeta[];
    selectedId: ShopProductCategory;
    onSelect: (id: ShopProductCategory) => void;
};

export function ShopCategoryMenu({ categories, selectedId, onSelect }: Props) {
    return (
        <aside style={s.showcaseMenu}>
            {categories.map((cat, idx) => {
                const active = cat.id === selectedId;
                return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelect(cat.id)}
                        style={active ? { ...s.menuItem, ...s.menuItemActive } : s.menuItem}
                    >
                        <span style={s.menuItemIndex}>{idx + 1}</span>
                        <span style={s.menuItemText}>{cat.title}</span>
                    </button>
                );
            })}
        </aside>
    );
}
