// frontend/src/pages/timetable/ui/components/CreateTrainingButton/CreateTrainingButton.tsx

import { useState } from "react"
import { useIsCoach } from "../../../../members/model/useIsCoach"
import { CreateTrainingModal } from "../CreateTrainingModal/CreateTrainingModal"
import { createTrainingButtonStyles as s } from "./createTrainingButton.styles"

type Props = {
    date: string | null
}

export function CreateTrainingButton({ date }: Props) {

    const isCoach = useIsCoach()
    const [open, setOpen] = useState(false)

    if (!isCoach || !date) {
        return null
    }

    return (
        <>
            <button
                style={s.button}
                onClick={() => setOpen(true)}
            >
                +
            </button>

            <CreateTrainingModal
                open={open}
                date={date}
                onClose={() => setOpen(false)}
            />
        </>
    )
}