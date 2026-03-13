// frontend/src/pages/timetable/ui/components/TrainingInfoModal/TrainingInfoModal.tsx

import type { MyScheduleItem } from "../../../../mySchedule/model/mySchedule.types";
import type { TrainerScheduleItem } from "../../../model/trainerSchedule.types";
import { trainingInfoModalStyles as s } from "./trainingInfoModal.styles";

type Props = {
    open: boolean;
    item: MyScheduleItem | TrainerScheduleItem | null;
    isCoach: boolean;
    onClose: () => void;
    onRequestCancel?: (item: MyScheduleItem) => void;
};

export function TrainingInfoModal({ open, item, isCoach, onClose, onRequestCancel }: Props) {
    if (!open || !item) {
        return null;
    }

    const time = item.startsAt?.slice(11, 16) ?? "";

    let nameLabel = "";

    if (isCoach) {
        const trainerItem = item as TrainerScheduleItem;
        nameLabel = trainerItem.studentName ?? "";
    } else {
        const athleteItem = item as MyScheduleItem;
        nameLabel = athleteItem.coachName ?? "";
    }

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <button
                    type="button"
                    style={s.close}
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <div style={s.title}>
                    Тренировка
                </div>

                <div style={s.row}>
                    Время: {time}
                </div>

                {nameLabel ? (
                    <div style={s.row}>
                        {isCoach ? "Ученик" : "Тренер"}: {nameLabel}
                    </div>
                ) : null}

                {!isCoach ? (
                    <div style={s.actions}>
                        <button
                            type="button"
                            style={s.requestCancel}
                            onClick={() => {
                                onRequestCancel?.(item as MyScheduleItem);
                                onClose();
                            }}
                        >
                            Запросить отмену
                        </button>
                    </div>
                ) : null}

            </div>
        </div>
    );
}
