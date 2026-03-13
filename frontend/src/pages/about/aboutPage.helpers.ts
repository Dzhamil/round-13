import type { RuleResponse } from "../../shared/api/rules.api";
import type { InfoPageResponse } from "./model/about.types";
import type { AboutEditablePageCode } from "./model/about.types";
import { ABOUT_PAGE_TITLES, ABOUT_TAB_TO_PAGE_CODE, type AboutTab, type AboutTabId } from "./aboutPage.constants";
import type { Rule } from "../rules/rules.utils";

export type ContactCard = {
    title: string;
    value: string;
    hint: string;
};

export function toRule(rule: RuleResponse): Rule {
    return {
        code: rule.code,
        title: rule.title,
        content: rule.content,
        sortOrder: rule.sortOrder,
    };
}

export function splitTextToParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/g)
        .map((part) => part.trim())
        .filter(Boolean);
}

export function parseContactsContent(page: InfoPageResponse | null): ContactCard[] {
    if (!page?.content) {
        return [];
    }

    return page.content
        .split(/\n\s*\n/g)
        .map((block) =>
            block
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
        )
        .filter((lines) => lines.length >= 2)
        .map((lines) => ({
            title: lines[0],
            value: lines[1],
            hint: lines.slice(2).join("\n"),
        }));
}

export function formatUpdatedAt(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function resolveActiveTab(pathname: string, tabs: AboutTab[]): AboutTab {
    return tabs.find((tab) => {
        if (tab.end) {
            return pathname === tab.to || pathname === `${tab.to}/`;
        }

        return pathname.startsWith(tab.to);
    }) ?? tabs[0];
}

export function getEditablePageCode(tabId: AboutTabId): AboutEditablePageCode | null {
    return ABOUT_TAB_TO_PAGE_CODE[tabId] ?? null;
}

export function getDefaultInfoPageTitle(code: AboutEditablePageCode): string {
    return ABOUT_PAGE_TITLES[code];
}

export function getInfoPageEditorHint(code: AboutEditablePageCode): string | null {
    if (code === "contacts") {
        return "Для карточек контактов используйте блоки через пустую строку: заголовок, значение, затем пояснение при необходимости.";
    }

    return null;
}

export function getInfoPageByCode(
    code: AboutEditablePageCode,
    pages: {
        page: InfoPageResponse | null;
        contactsPage: InfoPageResponse | null;
        newcomersPage: InfoPageResponse | null;
    },
): InfoPageResponse | null {
    switch (code) {
        case "about":
            return pages.page;
        case "contacts":
            return pages.contactsPage;
        case "newcomers":
            return pages.newcomersPage;
        default:
            return null;
    }
}

export function getStatusCode(error: unknown): number | null {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return null;
    }

    const response = (error as { response?: { status?: number } }).response;
    return typeof response?.status === "number" ? response.status : null;
}
