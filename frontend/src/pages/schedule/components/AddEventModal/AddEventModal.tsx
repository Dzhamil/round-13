import { Button } from "../../../../shared/ui/Button";
import type { EventTypeOption } from "../../model/schedule.types";
import { AddEventTypeSelect } from "./AddEventTypeSelect";
import { addEventModalStyles as s } from "./addEventModal.styles";

type Props = {
    open: boolean;
    title: string;
    description: string;
    type: string;
    typeOpen: boolean;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    selectedType: EventTypeOption;
    options: EventTypeOption[];
    onClose: () => void;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onTypeToggle: () => void;
    onTypeSelect: (value: string) => void;
};

export function AddEventModal({
    open,
    title,
    description,
    type,
    typeOpen,
    date,
    startTime,
    endTime,
    location,
    selectedType,
    options,
    onClose,
    onTitleChange,
    onDescriptionChange,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
    onLocationChange,
    onTypeToggle,
    onTypeSelect,
}: Props) {
    if (!open) {
        return null;
    }

    return (
        <div
            style={s.modalOverlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div style={s.modalCard}>
                <div style={s.modalHeader}>
                    <h3 style={s.modalTitle}>Добавить событие</h3>
                    <p style={s.modalHint}>
                        Пока собираем только форму. Сохранение подключим следующим шагом.
                    </p>
                </div>

                <div style={s.formGrid}>
                    <label style={s.field}>
                        <span style={s.fieldLabel}>Название</span>
                        <input
                            style={s.input}
                            value={title}
                            onChange={(event) => onTitleChange(event.target.value)}
                            placeholder="Например, Кубок клуба Round 13"
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Тип события</span>
                        <AddEventTypeSelect
                            value={type}
                            open={typeOpen}
                            selectedLabel={selectedType.label}
                            options={options}
                            onToggle={onTypeToggle}
                            onSelect={onTypeSelect}
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Описание</span>
                        <textarea
                            style={s.textarea}
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                            placeholder="Что это за событие, для кого оно и что важно знать участникам"
                        />
                    </label>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Дата</span>
                        <input
                            style={s.input}
                            type="date"
                            value={date}
                            onChange={(event) => onDateChange(event.target.value)}
                        />
                    </label>

                    <div style={s.timeRow}>
                        <label style={s.field}>
                            <span style={s.fieldLabel}>Время начала</span>
                            <input
                                style={s.input}
                                type="time"
                                value={startTime}
                                onChange={(event) => onStartTimeChange(event.target.value)}
                            />
                        </label>

                        <label style={s.field}>
                            <span style={s.fieldLabel}>Время окончания</span>
                            <input
                                style={s.input}
                                type="time"
                                value={endTime}
                                onChange={(event) => onEndTimeChange(event.target.value)}
                            />
                        </label>
                    </div>

                    <label style={s.field}>
                        <span style={s.fieldLabel}>Место</span>
                        <input
                            style={s.input}
                            value={location}
                            onChange={(event) => onLocationChange(event.target.value)}
                            placeholder="Например, зал Round 13 или адрес площадки"
                        />
                    </label>
                </div>

                <div style={s.modalActions}>
                    <Button onClick={onClose} variant="secondary">
                        Закрыть
                    </Button>
                    <Button disabled>Сохранить</Button>
                </div>
            </div>
        </div>
    );
}
