import type { ProfileEntitlementActivityItem } from "../../../../../shared/api/account.api";
import { myEntitlementActivityBlockStyles as s } from "./myEntitlementActivityBlock.styles";

type Props = {
    items: ProfileEntitlementActivityItem[];
};

function formatDelta(delta: number): string {
    return `${delta > 0 ? "+" : ""}${delta}`;
}

function formatOccurredAt(value: string): string {
    return new Date(value).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function MyEntitlementActivityBlock({ items }: Props) {
    return (
        <div style={s.root}>
            <div style={s.title}>История пакетов</div>

            {items.length === 0 ? (
                <div style={s.empty}>Пока нет операций по пакетам.</div>
            ) : (
                <div style={s.list}>
                    {items.map((item) => {
                        const badgeStyle = item.delta >= 0
                            ? { ...s.badgeBase, ...s.badgePositive }
                            : { ...s.badgeBase, ...s.badgeNegative };

                        return (
                            <div key={item.id} style={s.item}>
                                <div style={s.header}>
                                    <div style={s.itemTitle}>{item.title}</div>
                                    <div style={badgeStyle}>{formatDelta(item.delta)}</div>
                                </div>
                                {item.subtitle ? <div style={s.subtitle}>{item.subtitle}</div> : null}
                                <div style={s.meta}>
                                    <div>Остаток после операции: {item.balanceAfter}</div>
                                    <div>{formatOccurredAt(item.occurredAt)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
