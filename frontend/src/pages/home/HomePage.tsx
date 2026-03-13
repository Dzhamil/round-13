// frontend/src/pages/home/HomePage.tsx
import { RadialMenu } from "./RadialMenu";
import { homePageStyles as s } from "./homePage.styles";

/**
 * Главная страница.
 * Ничего кроме weapon wheel.
 * Центрирование строго по viewport (пересечение диагоналей).
 */
export function HomePage() {
    return (
        <div style={s.root}>
            <div style={s.center}>
                <RadialMenu />
            </div>
        </div>
    );
}
