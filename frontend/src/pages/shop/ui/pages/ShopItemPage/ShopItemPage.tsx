// frontend/src/pages/shop/ui/pages/ShopItemPage.tsx
import { Navigate, useParams } from "react-router-dom";
import { ShopItemDetails } from "../../components";

const SHOP_PATH = "/shop";

export function ShopItemPage() {
    const { code } = useParams<{ code: string }>();

    if (!code) return <Navigate to={SHOP_PATH} replace />;

    return <ShopItemDetails code={code} />;
}