import type { ShopCategoryMeta } from "../../../model/shop.constants";
import { shopPageStyles as s } from "../../../styles/shopPage.styles";

type Props = {
    category: ShopCategoryMeta;
    itemsCount: number;
    onOpen: () => void;
};

export function ShopCategoryPreview({ category, itemsCount, onOpen }: Props) {
    const facts = [
        ...(category.facts ?? []),
        { label: "ДОСТУПНО", value: `${itemsCount} шт.` },
    ];

    return (
        <section style={s.previewPanel}>
            {category.previewImageUrl ? (
                <div style={s.previewMediaFrame}>
                    <img
                        src={category.previewImageUrl}
                        alt={category.title}
                        style={s.previewImage}
                        loading="lazy"
                    />
                </div>
            ) : (
                <div style={s.previewMediaFrame} />
            )}

            <div style={s.previewTitle}>{category.title}</div>
            <div style={s.previewText}>{category.description}</div>

            {facts.length > 0 && (
                <div style={s.factsList}>
                    {facts.map((f, i) => (
                        <div key={`${f.label}-${i}`} style={s.factRow}>
                            <span style={s.factLabel}>{f.label}</span>
                            <span style={s.factValue}>{f.value}</span>
                        </div>
                    ))}
                </div>
            )}

            <button type="button" onClick={onOpen} style={s.openCategoryButton}>
                ОТКРЫТЬ
            </button>
        </section>
    );
}
