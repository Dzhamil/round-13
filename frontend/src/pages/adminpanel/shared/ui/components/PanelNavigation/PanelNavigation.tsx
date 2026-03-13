import { NavLink } from "react-router-dom";
import { panelNavigationStyles as styles } from "./PanelNavigation.styles";

type PanelNavigationProps = {
    active: "content" | "users";
};

export function PanelNavigation(props: PanelNavigationProps) {
    const { active } = props;

    return (
        <nav style={styles.nav} aria-label="Навигация админ-панели">
            <NavLink
                to="/admin/content"
                style={{
                    ...styles.link,
                    ...(active === "content" ? styles.linkActive : {}),
                }}
            >
                Контент клуба
            </NavLink>

            <NavLink
                to="/admin/users"
                style={{
                    ...styles.link,
                    ...(active === "users" ? styles.linkActive : {}),
                }}
            >
                Пользователи
            </NavLink>
        </nav>
    );
}
