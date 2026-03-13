import { Outlet, useOutletContext } from "react-router-dom";
import styles from "./AboutPage.module.css";
import { ABOUT_TABS } from "./aboutPage.constants";
import { formatUpdatedAt } from "./aboutPage.helpers";
import type { AboutOutletContext } from "./model/about.types";
import { useAboutPage } from "./model/useAboutPage";
import {
    AboutContactsTab,
    AboutHero,
    AboutNewcomersTab,
    AboutOverviewTab,
    AboutRulesTab,
    AboutTabs,
} from "./components";

function useAboutContext() {
    return useOutletContext<AboutOutletContext>();
}

export function AboutPage() {
    const {
        page,
        contactsPage,
        newcomersPage,
        rules,
        isPageLoading,
        isContactsLoading,
        isNewcomersLoading,
        isRulesLoading,
        pageError,
        contactsError,
        newcomersError,
        rulesError,
    } = useAboutPage();

    if (isPageLoading) {
        return <div className={styles.stateCard}>Загружаем информацию о клубе…</div>;
    }

    if (pageError || !page) {
        return (
            <div className={styles.stateCard}>
                {pageError ?? "Информация о клубе пока недоступна."}
            </div>
        );
    }

    const updatedAt = formatUpdatedAt(page.updatedAt);

    return (
        <div className={styles.page}>
            <AboutHero
                title={page.title}
                updatedAt={updatedAt}
            />

            <AboutTabs tabs={ABOUT_TABS} />

            <section className={styles.panel}>
                <Outlet
                    context={{
                        page,
                        contactsPage,
                        newcomersPage,
                        isContactsLoading,
                        isNewcomersLoading,
                        contactsError,
                        newcomersError,
                        rules,
                        isRulesLoading,
                        rulesError,
                    }}
                />
            </section>
        </div>
    );
}

export function AboutOverviewPage() {
    const { page } = useAboutContext();
    return <AboutOverviewTab page={page} />;
}

export function AboutRulesPage() {
    const { rules, isRulesLoading, rulesError } = useAboutContext();
    return <AboutRulesTab rules={rules} loading={isRulesLoading} error={rulesError} />;
}

export function AboutContactsPage() {
    const { contactsPage, isContactsLoading, contactsError } = useAboutContext();
    return (
        <AboutContactsTab
            page={contactsPage}
            loading={isContactsLoading}
            error={contactsError}
        />
    );
}

export function AboutNewcomersPage() {
    const { newcomersPage, isNewcomersLoading, newcomersError } = useAboutContext();

    return (
        <AboutNewcomersTab
            page={newcomersPage}
            loading={isNewcomersLoading}
            error={newcomersError}
        />
    );
}

export default AboutPage;
