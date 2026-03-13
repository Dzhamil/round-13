import type { MyScheduleItem } from "../../../model/mySchedule.types";
import { MyScheduleItem as MyScheduleItemCard } from "../index";
import { myScheduleBlockStyles as s } from "./MyScheduleBlock.styles";

type Props = {
    title?: string;
    loading: boolean;
    error: string | null;
    items: MyScheduleItem[];
    onRetry?: () => void;
};

export function MyScheduleBlock({
                                    title = "Моё расписание",
                                    loading,
                                    error,
                                    items,
                                    onRetry,
                                }: Props) {
    return (
        <div style={s.root}>
            <h3 style={s.title}>{title}</h3>

            {loading ? (
                <div>Загрузка расписания…</div>
            ) : error ? (
                <div style={s.errorWrap}>
                    <div>{error}</div>

                    {onRetry ? (
                        <button
                            type="button"
                            onClick={onRetry}
                            style={s.retryButton}
                        >
                            Повторить
                        </button>
                    ) : null}
                </div>
            ) : items.length === 0 ? (
                <div style={s.hint}>
                    Вы пока не записаны на тренировки
                </div>
            ) : (
                <div style={s.list}>
                    {items.map((item) => (
                        <MyScheduleItemCard
                            key={item.sessionId}
                            item={item}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
