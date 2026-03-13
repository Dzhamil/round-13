import ErrorText from "../../../shared/ui/ErrorText";

export function SchedulePageError({ message }: { message: string | null }) {
    if (!message) return null;
    return <ErrorText message={message} />;
}
