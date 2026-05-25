// frontend/src/shared/ui/AppHeader/AppHeader.tsx
import { useBackNavigation } from "../../lib/navigation";
import { SoundToggleButton } from "../SoundToggleButton";
import { appHeaderStyles as s } from "./appHeader.styles";

type AppHeaderProps = {
    title?: string;
    studentsCount?: number | null;
};

export function AppHeader({ title }: AppHeaderProps) {
    const { navigateBack } = useBackNavigation({ fallback: "/" });

    return (
        <header style={s.header}>
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
