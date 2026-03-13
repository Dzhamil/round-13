import type { EntitlementItem } from "../../../model/profile.types";
import { myEntitlementsBlockStyles as s } from "./myEntitlementsBlock.styles";

type MyEntitlementsBlockProps = {
    items: EntitlementItem[];
};

/**
 * Блок "Мои услуги".
 *
 * UI-отображение начисленных услуг пользователя.
 */
export function MyEntitlementsBlock({ items }: MyEntitlementsBlockProps) {
    return (
        <div style={s.root}>
            <div style={s.title}>Мои услуги</div>

            {items.length === 0 ? (
                <div style={s.empty}>Пока нет активных услуг.</div>
            ) : (
                <div style={s.list}>
                    {items.map((it) => (
                        <div key={it.id} style={s.item}>
                            <div style={s.itemTitle}>{it.title}</div>
                            {it.subtitle ? <div style={s.itemSubtitle}>{it.subtitle}</div> : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
