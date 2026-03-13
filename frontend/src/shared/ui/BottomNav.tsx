// frontend/src/shared/ui/BottomNav.tsx
import { NavLink } from "react-router-dom";
import { bottomNavStyles as s } from "./bottomNav.styles";

export type BottomNavItem = {
    to: string;
    label: string;
};

type BottomNavProps = {
    items: BottomNavItem[];
};

export function BottomNav({ items }: BottomNavProps) {
    // IMPORTANT: фиксированная панель снизу
    // Контент страницы не должен залезать под неё -> это уже решено paddingBottom в appShell.styles.ts
    return (
        <div style={s.fixedWrap}>
            <div style={s.fixedInner}>
                <nav style={{ ...s.nav, gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
                    {items.map((it) => (
                        <NavLink
                            key={it.to}
                            to={it.to}
                            style={({ isActive }) => s.item(isActive)}
                        >
                            {it.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}
