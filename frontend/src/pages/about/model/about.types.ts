import type { Rule } from "../../rules/rules.utils";

export type AboutEditablePageCode = "about" | "contacts" | "newcomers";

export type InfoPageResponse = {
    code: string;
    title: string;
    content: string;
    updatedAt: string; // ISO
};

export type UpsertInfoPagePayload = {
    title: string;
    content: string;
};

export type AboutOutletContext = {
    page: InfoPageResponse;
    contactsPage: InfoPageResponse | null;
    newcomersPage: InfoPageResponse | null;
    isContactsLoading: boolean;
    isNewcomersLoading: boolean;
    contactsError: string | null;
    newcomersError: string | null;
    rules: Rule[];
    isRulesLoading: boolean;
    rulesError: string | null;
};
