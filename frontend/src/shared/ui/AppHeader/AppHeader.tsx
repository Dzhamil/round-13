// frontend/src/shared/ui/AppHeader/AppHeader.tsx
import { useLocation, useMatches, useNavigate } from "react-router-dom";
import { readBackTo } from "../../lib/navigation";
import { SoundToggleButton } from "../SoundToggleButton";
import { appHeaderStyles as s } from "./appHeader.styles";

type AppHeaderProps = {
    title?: string;
    studentsCount?: number | null;
};

type AppRouteHandle = {
    backTo?: string;
};

export function AppHeader({ title }: AppHeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const matches = useMatches();
    const isHome = location.pathname === "/";

    const currentMatch = matches[matches.length - 1];
    const routeBackTo = (currentMatch?.handle as AppRouteHandle | undefined)?.backTo;
    const stateBackTo = readBackTo(location.state);
    const backTo = stateBackTo && stateBackTo !== location.pathname
        ? stateBackTo
        : routeBackTo;
    const hasBackTarget = Boolean(backTo && backTo !== location.pathname);

    function onBack() {
        navigate(backTo && backTo !== location.pathname ? backTo : "/", { replace: true });
    }

    return (
        <header style={s.header}>
            {title || hasBackTarget ? (
                <button type="button" onClick={onBack} aria-label="Назад" style={s.backBtn}>
                    ←
                </button>
            ) : (
                <div style={s.sideSlot} />
            )}

            <div style={s.title}>
                {title ?? "13 ROUND Boxing Club"}
            </div>

            <div style={s.sideSlot}>
                {isHome ? <SoundToggleButton /> : null}
            </div>
        </header>
    );
}
