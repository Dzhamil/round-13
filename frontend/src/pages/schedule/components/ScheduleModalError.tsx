// frontend/src/pages/schedule/components/ScheduleModalError.tsx
import ErrorText from "../../../shared/ui/ErrorText";

export function ScheduleModalError({ message }: { message: string | null }) {
    if (!message) return null;
    return <ErrorText message={message} />;
}
