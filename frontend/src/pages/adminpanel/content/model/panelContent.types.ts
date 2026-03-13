export type EditableInfoPageCode = "about" | "contacts" | "newcomers";

export type EditableInfoPage = {
    code: EditableInfoPageCode;
    title: string;
    content: string;
    updatedAt: string | null;
};

export type AdminNewsPost = {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type EditableNewsForm = {
    id: string | null;
    title: string;
    excerpt: string;
    content: string;
    published: boolean;
};
