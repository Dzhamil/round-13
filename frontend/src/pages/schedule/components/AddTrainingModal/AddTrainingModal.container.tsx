import { useEffect, useState } from "react";

import { AddTrainingModal } from "./AddTrainingModal";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddTrainingModalContainer({ open, onClose }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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

    return (
        <AddTrainingModal
            open={open}
            title={title}
            description={description}
            date={date}
            startTime={startTime}
            endTime={endTime}
            location={location}
            onClose={onClose}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onLocationChange={setLocation}
        />
    );
}
