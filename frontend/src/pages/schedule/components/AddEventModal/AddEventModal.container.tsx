import { useEffect, useState } from "react";

import { EVENT_TYPE_OPTIONS } from "../../model/schedule.types";
import { AddEventModal } from "./AddEventModal";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddEventModalContainer({ open, onClose }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("CLUB_EVENT");
    const [typeOpen, setTypeOpen] = useState(false);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        setTypeOpen(false);
    }, [open]);

    const selectedType = EVENT_TYPE_OPTIONS.find((option) => option.value === type) ?? EVENT_TYPE_OPTIONS[0];

    return (
        <AddEventModal
            open={open}
            title={title}
            description={description}
            type={type}
            typeOpen={typeOpen}
            date={date}
            startTime={startTime}
            endTime={endTime}
            location={location}
            selectedType={selectedType}
            options={EVENT_TYPE_OPTIONS}
            onClose={onClose}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onLocationChange={setLocation}
            onTypeToggle={() => setTypeOpen((current) => !current)}
            onTypeSelect={(value) => {
                setType(value);
                setTypeOpen(false);
            }}
        />
    );
}
