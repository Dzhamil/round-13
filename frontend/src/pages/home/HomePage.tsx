import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMe } from "../../shared/api/account.api";
import { isProfileComplete } from "../profile/lib/profile.completeness";
import { RadialMenu } from "./RadialMenu";
import { HomePulseTicker } from "./components/HomePulseTicker";
import styles from "./HomePage.module.css";
import { useHomePulse } from "./model/useHomePulse";

/**
 * Главная страница.
 * Главный экран клуба: колесо навигации и живая строка актуальных событий.
 */
export function HomePage() {
    const { items, isLoading, error, reload } = useHomePulse();

    const [verificationRequired, setVerificationRequired] = useState(false);

    useEffect(() => {
        let isActive = true;

        getMe()
            .then((me) => {
                if (isActive) {
                    setVerificationRequired(!isProfileComplete(me));
                }
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className={styles.page} data-testid="home-page">
            <div
                aria-hidden="true"
                className={styles.backgroundLayer}
                data-testid="home-background"
            />
            <div className={styles.menuPanel} data-testid="home-menu-content">
                <RadialMenu />
                <div className={styles.actions}>
                    {verificationRequired && (
                        <Link className={`${styles.actionButton} ${styles.verificationButton}`} to="/profile?verify=1">
                            Пройти верификацию
                        </Link>
                    )}
                </div>
            </div>

            <div className={styles.tickerDock}>
                <HomePulseTicker
                    items={items}
                    isLoading={isLoading}
                    error={error}
                    onRetry={reload}
                />
            </div>
        </div>
    );
}
