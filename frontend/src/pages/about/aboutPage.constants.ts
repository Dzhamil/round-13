type AboutTabId = "overview" | "rules" | "contacts" | "newcomers";

export type AboutTab = {
    id: AboutTabId;
    label: string;
    to: string;
    end?: boolean;
};

export const ABOUT_TABS: AboutTab[] = [
    { id: "overview", label: "О клубе", to: "/about", end: true },
    { id: "rules", label: "Правила", to: "/about/rules" },
    { id: "contacts", label: "Контакты", to: "/about/contacts" },
    { id: "newcomers", label: "Новичкам", to: "/about/newcomers" },
];
