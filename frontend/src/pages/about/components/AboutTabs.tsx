import { NavLink } from "react-router-dom";
import styles from "../AboutPage.module.css";
import type { AboutTab } from "../aboutPage.constants";

type AboutTabsProps = {
    tabs: AboutTab[];
};

export function AboutTabs(props: AboutTabsProps) {
    const { tabs } = props;

    return (
        <nav className={styles.tabs} aria-label="Разделы страницы О нас">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.id}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                        `${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`
                    }
                >
                    <span className={styles.tabLabel}>{tab.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
