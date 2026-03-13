import type { ShopCategoryResponse } from "../../../api/category.api";
import { shopCategoryCardStyles as s } from "./CategoryCard.styles";

type Props = {
    category: ShopCategoryResponse;
    itemsCount?: number;
    isAdmin?: boolean;
    onOpen: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export function CategoryCard({
                                 category,
                                 itemsCount,
                                 isAdmin = false,
                                 onOpen,
                                 onEdit,
                                 onDelete,
                             }: Props) {
    return (
        <div style={s.categoryCardContainer}>
            <button type="button" style={s.categoryCardContent} onClick={onOpen}>
                {category.previewImageUrl ? (
                    <img
                        src={category.previewImageUrl}
                        alt={category.title}
                        style={s.categoryCardImage}
                        loading="lazy"
                    />
                ) : (
                    <div style={s.categoryCardImage} />
                )}

                <div>
                    <div style={s.categoryCardTitle}>{category.title}</div>
                    <p style={s.categoryCardDescription}>{category.description}</p>

                    {typeof itemsCount === "number" && (
                        <div style={s.categoryCardCount}>
                            Доступно: {itemsCount} шт.
                        </div>
                    )}
                </div>
            </button>

            {isAdmin && (
                <div style={s.categoryCardActions}>
                    <button type="button" style={s.categoryCardActionBtn} onClick={onEdit}>
                        Редактировать
                    </button>

                    <button
                        type="button"
                        style={{ ...s.categoryCardActionBtn, ...s.categoryCardDeleteBtn }}
                        onClick={onDelete}
                    >
                        Удалить
                    </button>
                </div>
            )}
        </div>
    );
}