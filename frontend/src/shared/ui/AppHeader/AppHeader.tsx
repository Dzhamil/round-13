// frontend/src/shared/ui/AppHeader/AppHeader.tsx
import { useNavigate } from "react-router-dom";
import { SoundToggleButton } from "../SoundToggleButton";
import { appHeaderStyles as s } from "./appHeader.styles";

type AppHeaderProps = {
    title?: string;
    studentsCount?: number | null;
};

export function AppHeader({ title }: AppHeaderProps) {
    const navigate = useNavigate();

    function onBack() {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    }

    return (
        <header style={s.header}>
            {title ? (
                <button type="button" onClick={onBack} aria-label="Назад" style={s.backBtn}>
                    ←
                </button>
            ) : (
                <div style={s.sideSlot} />
            )}

            <div style={s.title}>
                {title ?? "13 раунд"}
            </div>

            <div style={s.sideSlot}>
                <SoundToggleButton />
            </div>
        </header>
    );
}