import { useParams } from "react-router-dom";
import { DayPage } from "./DayPage";

export function DayPageContainer() {
    const { date } = useParams<{ date: string }>();

    return <DayPage date={date} />;
}