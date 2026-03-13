// frontend/src/pages/home/OpenButton.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { tg } from "../../tg";
import { homePageStyles as s } from "./homePage.styles";

/**
 * Кнопка «ОТКРЫТЬ».
 * Ведёт в основное меню (афиша/расписание).
 */
export function OpenButton() {
    const navigate = useNavigate();

    function handleClick() {
        tg?.HapticFeedback?.impactOccurred?.("light");
        navigate("/schedule");
    }

    return (
        <div style={s.cta}>
            <Button onClick={handleClick} fullWidth>
                ОТКРЫТЬ
            </Button>
        </div>
    );
}
