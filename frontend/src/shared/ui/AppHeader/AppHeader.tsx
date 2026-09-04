// frontend/src/shared/ui/AppHeader/AppHeader.tsx
import { useBackNavigation } from "../../lib/navigation";
import { SoundToggleButton } from "../SoundToggleButton";
import { appHeaderStyles as s } from "./appHeader.styles";

type AppHeaderProps = {
    title?: string;
    studentsCount?: number | null;
    appearance?: "default" | "home";
};

export function AppHeader({ title, appearance = "default" }: AppHeaderProps) {
    const { navigateBack } = useBackNavigation({ fallback: "/" });

    return (
        <header style={appearance === "home" ? s.headerHome : s.header}>
            {title ? (
                <button type="button" onClick={navigateBack} aria-label="Назад" style={s.backBtn}>
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
