import { useEffect, useState } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import styles from "./AboutPage.module.css";
import { ABOUT_TABS } from "./aboutPage.constants";
import {
    getEditablePageCode,
    getInfoPageByCode,
    resolveActiveTab,
} from "./aboutPage.helpers";
import type { AboutOutletContext } from "./model/about.types";
import { useAboutPage } from "./model/useAboutPage";
import {
    AboutContactsTab,
    AboutEditorCard,
    AboutHero,
    AboutNewcomersTab,
    AboutOverviewTab,
    AboutPageActions,
    AboutRulesTab,
    AboutTabs,
} from "./components";

function useAboutContext() {
    return useOutletContext<AboutOutletContext>();
}

export function AboutPage() {
    const location = useLocation();
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
        canEditContent,
        isRoleLoading,
        isSaving,
        saveError,
        dismissSaveError,
        saveInfoPage,
    } = useAboutPage();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const activeTab = resolveActiveTab(location.pathname, ABOUT_TABS);
    const editablePageCode = getEditablePageCode(activeTab.id);

    useEffect(() => {
        setIsEditorOpen(false);
        dismissSaveError();
    }, [activeTab.id, dismissSaveError]);

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

    const activeInfoPage = editablePageCode
        ? getInfoPageByCode(editablePageCode, { page, contactsPage, newcomersPage })
        : null;
    const heroTitle = activeInfoPage?.title?.trim() || activeTab.label;

    async function handleSave(payload: { title: string; content: string }) {
        if (!editablePageCode) {
            return;
        }

        const saved = await saveInfoPage(editablePageCode, payload);
        if (saved) {
            setIsEditorOpen(false);
        }
    }

    return (
        <div className={styles.page}>
            <AboutHero
                title={heroTitle}
            />

            <AboutTabs tabs={ABOUT_TABS} />

            <section className={styles.panel}>
                {canEditContent && !isRoleLoading && (
                    <AboutPageActions
                        editablePageCode={editablePageCode}
                        isEditing={isEditorOpen}
                        onToggleEditing={() => {
                            dismissSaveError();
                            setIsEditorOpen((current) => !current);
                        }}
                    />
                )}

                {canEditContent && editablePageCode && isEditorOpen && (
                    <AboutEditorCard
                        pageCode={editablePageCode}
                        page={activeInfoPage}
                        isSaving={isSaving}
                        error={saveError}
                        onCancel={() => {
                            dismissSaveError();
                            setIsEditorOpen(false);
                        }}
                        onSave={handleSave}
                    />
                )}

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
