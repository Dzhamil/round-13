import type {
    AdminNewsPost,
    EditableInfoPage,
    EditableInfoPageCode,
    EditableNewsForm,
} from "./panelContent.types";

export function createEmptyPage(code: EditableInfoPageCode, title: string): EditableInfoPage {
    return {
        code,
        title,
        content: "",
        updatedAt: null,
    };
}

export function createInitialPages(): Record<EditableInfoPageCode, EditableInfoPage> {
    return {
        about: createEmptyPage("about", "О клубе"),
        contacts: createEmptyPage("contacts", "Контакты"),
        newcomers: createEmptyPage("newcomers", "Новичкам"),
    };
}

export function createEmptyNewsForm(): EditableNewsForm {
    return {
        id: null,
        title: "",
        excerpt: "",
        content: "",
        published: false,
    };
}

export function toNewsForm(item: AdminNewsPost): EditableNewsForm {
    return {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt ?? "",
        content: item.content,
        published: item.published,
    };
}
