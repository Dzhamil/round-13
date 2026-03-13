import { useCallback, useEffect, useState } from "react";
import { getMe } from "../../../shared/api/account.api";
import { getRules } from "../../../shared/api/rules.api";
import { isAdminRole } from "../../../shared/lib/roles";
import { aboutAdminApi } from "../api/aboutAdmin.api";
import { aboutApi } from "../api/about.api";
import type { AboutEditablePageCode, InfoPageResponse, UpsertInfoPagePayload } from "./about.types";
import type { Rule } from "../../rules/rules.utils";
import { getStatusCode, toRule } from "../aboutPage.helpers";

type UseAboutPageResult = {
    page: InfoPageResponse | null;
    contactsPage: InfoPageResponse | null;
    newcomersPage: InfoPageResponse | null;
    rules: Rule[];
    isPageLoading: boolean;
    isContactsLoading: boolean;
    isNewcomersLoading: boolean;
    isRulesLoading: boolean;
    pageError: string | null;
    contactsError: string | null;
    newcomersError: string | null;
    rulesError: string | null;
    canEditContent: boolean;
    isRoleLoading: boolean;
    isSaving: boolean;
    saveError: string | null;
    dismissSaveError: () => void;
    saveInfoPage: (code: AboutEditablePageCode, payload: UpsertInfoPagePayload) => Promise<boolean>;
};

export function useAboutPage(): UseAboutPageResult {
    const [page, setPage] = useState<InfoPageResponse | null>(null);
    const [contactsPage, setContactsPage] = useState<InfoPageResponse | null>(null);
    const [newcomersPage, setNewcomersPage] = useState<InfoPageResponse | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isContactsLoading, setIsContactsLoading] = useState(true);
    const [isNewcomersLoading, setIsNewcomersLoading] = useState(true);
    const [isRulesLoading, setIsRulesLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [contactsError, setContactsError] = useState<string | null>(null);
    const [newcomersError, setNewcomersError] = useState<string | null>(null);
    const [rulesError, setRulesError] = useState<string | null>(null);
    const [canEditContent, setCanEditContent] = useState(false);
    const [isRoleLoading, setIsRoleLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        setPage(null);
        setContactsPage(null);
        setNewcomersPage(null);
        setRules([]);
        setIsPageLoading(true);
        setIsContactsLoading(true);
        setIsNewcomersLoading(true);
        setIsRulesLoading(true);
        setIsRoleLoading(true);
        setPageError(null);
        setContactsError(null);
        setNewcomersError(null);
        setRulesError(null);

        async function load() {
            const [aboutResult, contactsResult, newcomersResult, rulesResult, meResult] =
                await Promise.allSettled([
                    aboutApi.getAboutPage(),
                    aboutApi.getContactsPage(),
                    aboutApi.getNewcomersPage(),
                    getRules(),
                    getMe(),
                ]);

            if (cancelled) {
                return;
            }

            if (aboutResult.status === "fulfilled") {
                setPage(aboutResult.value);
            } else {
                setPageError("Не удалось загрузить информацию о клубе.");
            }
            setIsPageLoading(false);

            if (contactsResult.status === "fulfilled") {
                setContactsPage(contactsResult.value);
            } else if (getStatusCode(contactsResult.reason) !== 404) {
                setContactsError("Не удалось загрузить контакты клуба.");
            }
            setIsContactsLoading(false);

            if (newcomersResult.status === "fulfilled") {
                setNewcomersPage(newcomersResult.value);
            } else if (getStatusCode(newcomersResult.reason) !== 404) {
                setNewcomersError("Не удалось загрузить информацию для новичков.");
            }
            setIsNewcomersLoading(false);

            if (rulesResult.status === "fulfilled") {
                setRules(rulesResult.value.map(toRule).sort((a, b) => a.sortOrder - b.sortOrder));
            } else {
                setRulesError("Не удалось загрузить правила клуба.");
            }
            setIsRulesLoading(false);

            if (meResult.status === "fulfilled") {
                setCanEditContent(isAdminRole(meResult.value.role));
            } else {
                setCanEditContent(false);
            }
            setIsRoleLoading(false);
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    const dismissSaveError = useCallback(() => {
        setSaveError(null);
    }, []);

    const saveInfoPage = useCallback(async (
        code: AboutEditablePageCode,
        payload: UpsertInfoPagePayload,
    ): Promise<boolean> => {
        setIsSaving(true);
        setSaveError(null);

        try {
            await aboutAdminApi.upsertPage(code, payload);
            const updatedPage = await aboutApi.getPage(code);

            if (code === "about") {
                setPage(updatedPage);
            } else if (code === "contacts") {
                setContactsPage(updatedPage);
            } else {
                setNewcomersPage(updatedPage);
            }

            return true;
        } catch {
            setSaveError("Не удалось сохранить изменения. Попробуйте еще раз.");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
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
    };
}
