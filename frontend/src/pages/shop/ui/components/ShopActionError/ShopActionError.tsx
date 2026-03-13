import { shopPageStyles as s } from "../../../styles/shopPage.styles";

export function ShopActionError({ message }: { message: string | null }) {
    if (!message) return null;
    return <div style={s.actionError}>{message}</div>;
}