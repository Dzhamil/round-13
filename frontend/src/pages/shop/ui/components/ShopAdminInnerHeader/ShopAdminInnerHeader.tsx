// frontend/src/pages/shop/ui/components/ShopAdminInnerHeader/ShopAdminInnerHeader.tsx
import { shopAdminInnerHeaderStyles as s } from "./ShopAdminInnerHeader.styles";

type Props = {
    // пока статично, но оставим задел
    active?: "PRODUCTS" | "ORDERS";
    onSelect?: (tab: "PRODUCTS" | "ORDERS") => void;
};

export function ShopAdminInnerHeader({ active = "PRODUCTS", onSelect }: Props) {
    return (
        <div style={s.root} role="tablist" aria-label="Разделы магазина">
            <button
                type="button"
                style={{
                    ...s.tabBase,
                    ...(active === "PRODUCTS" ? s.tabActive : s.tabInactive),
                }}
                onClick={() => onSelect?.("PRODUCTS")}
                role="tab"
                aria-selected={active === "PRODUCTS"}
            >
                Товары
            </button>

            <button
                type="button"
                style={{
                    ...s.tabBase,
                    ...(active === "ORDERS" ? s.tabActive : s.tabInactive),
                }}
                onClick={() => onSelect?.("ORDERS")}
                role="tab"
                aria-selected={active === "ORDERS"}
            >
                Заявки на покупку
            </button>
        </div>
    );
}