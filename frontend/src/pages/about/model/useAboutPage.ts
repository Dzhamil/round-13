import { useEffect, useState } from "react";
import { getRules } from "../../../shared/api/rules.api";
import { aboutApi } from "../api/about.api";
import type { InfoPageResponse } from "./about.types";
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

    useEffect(() => {
        let cancelled = false;

        setIsPageLoading(true);
        setPageError(null);
        aboutApi
            .getAboutPage()
            .then((data) => {
                if (!cancelled) {
                    setPage(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPageError("Не удалось загрузить информацию о клубе.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsPageLoading(false);
                }
            });

        setIsContactsLoading(true);
        setContactsError(null);
        aboutApi
            .getContactsPage()
            .then((data) => {
                if (!cancelled) {
                    setContactsPage(data);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    if (getStatusCode(error) === 404) {
                        setContactsPage(null);
                    } else {
                        setContactsError("Не удалось загрузить контакты клуба.");
                    }
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsContactsLoading(false);
                }
            });

        setIsNewcomersLoading(true);
        setNewcomersError(null);
        aboutApi
            .getNewcomersPage()
            .then((data) => {
                if (!cancelled) {
                    setNewcomersPage(data);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    if (getStatusCode(error) === 404) {
                        setNewcomersPage(null);
                    } else {
                        setNewcomersError("Не удалось загрузить информацию для новичков.");
                    }
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsNewcomersLoading(false);
                }
            });

        setIsRulesLoading(true);
        setRulesError(null);
        getRules()
            .then((data) => {
                if (!cancelled) {
                    setRules(data.map(toRule).sort((a, b) => a.sortOrder - b.sortOrder));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setRulesError("Не удалось загрузить правила клуба.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsRulesLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
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
    };
}
