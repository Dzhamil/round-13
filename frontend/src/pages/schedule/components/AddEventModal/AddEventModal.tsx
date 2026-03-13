import { Button } from "../../../../shared/ui/Button";
import type { EventTypeOption } from "../../model/schedule.types";
import { ScheduleTimePicker } from "../ScheduleTimePicker";
import { AddEventTypeSelect } from "./AddEventTypeSelect";
import { addEventModalStyles as s } from "./addEventModal.styles";

type Props = {
    open: boolean;
    mode: "CREATE" | "EDIT";
    title: string;
    description: string;
    type: string;
    typeOpen: boolean;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    loading: boolean;
    error: string | null;
    timePickerOpen: boolean;
    timePickerTitle: string;
    timePickerHour: string;
    timePickerMinute: string;
    selectedType: EventTypeOption;
    options: EventTypeOption[];
    onClose: () => void;
    onSubmit: () => void;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onStartTimeOpen: () => void;
    onEndTimeOpen: () => void;
    onTimePickerClose: () => void;
    onTimePickerApply: () => void;
    onTimePickerHourChange: (value: string) => void;
    onTimePickerMinuteChange: (value: string) => void;
    onTypeToggle: () => void;
    onTypeSelect: (value: string) => void;
};

export function AddEventModal({
    open,
    mode,
    title,
    description,
    type,
    typeOpen,
    date,
    startTime,
    endTime,
    location,
    loading,
    error,
    timePickerOpen,
    timePickerTitle,
    timePickerHour,
    timePickerMinute,
    selectedType,
    options,
    onClose,
    onSubmit,
    onTitleChange,
    onDescriptionChange,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
    onLocationChange,
    onStartTimeOpen,
    onEndTimeOpen,
    onTimePickerClose,
    onTimePickerApply,
    onTimePickerHourChange,
    onTimePickerMinuteChange,
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
                    <h3 style={s.modalTitle}>{mode === "EDIT" ? "Редактировать событие" : "Добавить событие"}</h3>
                    <p style={s.modalHint}>Заполни основные данные события клуба.</p>
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
                            <button type="button" style={s.timeButton} onClick={onStartTimeOpen}>
                                {startTime || "Выбрать"}
                            </button>
                        </label>

                        <label style={s.field}>
                            <span style={s.fieldLabel}>Время окончания</span>
                            <button type="button" style={s.timeButton} onClick={onEndTimeOpen}>
                                {endTime || "Выбрать"}
                            </button>
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

                {error ? <p style={s.error}>{error}</p> : null}

                <div style={s.modalActions}>
                    <Button onClick={onClose} variant="secondary" disabled={loading}>
                        Закрыть
                    </Button>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "Сохранение..." : mode === "EDIT" ? "Сохранить изменения" : "Сохранить"}
                    </Button>
                </div>
            </div>

            <ScheduleTimePicker
                open={timePickerOpen}
                title={timePickerTitle}
                hour={timePickerHour}
                minute={timePickerMinute}
                onHourChange={onTimePickerHourChange}
                onMinuteChange={onTimePickerMinuteChange}
                onClose={onTimePickerClose}
                onApply={onTimePickerApply}
            />
        </div>
    );
}
