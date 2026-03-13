import type { ProfileEntitlementItem } from "../../../../../shared/api/account.api";
import { myEntitlementsBlockStyles as s } from "./myEntitlementsBlock.styles";

type MyEntitlementsBlockProps = {
    items: ProfileEntitlementItem[];
};

/**
 * Блок "Мои услуги".
 *
 * UI-отображение начисленных услуг пользователя.
 */
export function MyEntitlementsBlock({ items }: MyEntitlementsBlockProps) {
    return (
        <div style={s.root}>
            <div style={s.title}>Мои пакеты</div>

            {items.length === 0 ? (
                <div style={s.empty}>Пока нет активных пакетов.</div>
            ) : (
                <div style={s.list}>
                    {items.map((it) => (
                        <div key={it.id} style={s.item}>
                            <div style={s.itemHeader}>
                                <div style={s.itemTitle}>{it.title}</div>
                                <div style={s.itemBadge}>
                                    Осталось: {it.remainingQuantity}
                                </div>
                            </div>
                            {it.subtitle ? <div style={s.itemSubtitle}>{it.subtitle}</div> : null}
                            {it.usageHint ? <div style={s.itemHint}>{it.usageHint}</div> : null}
                            {it.expiresAt ? (
                                <div style={s.itemMeta}>
                                    Действует до: {new Date(it.expiresAt).toLocaleDateString("ru-RU")}
                                </div>
                            ) : (
                                <div style={s.itemMeta}>Без срока действия</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
