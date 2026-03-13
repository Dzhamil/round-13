import { panelHttp } from "../../../../shared/api/panelHttp";
import type {
    AdminNewsPost,
    EditableInfoPage,
    EditableInfoPageCode,
    EditableNewsForm,
} from "../model/panelContent.types";

type UpsertInfoPageRequest = {
    title: string;
    content: string;
};

type UpsertNewsRequest = {
    title: string;
    excerpt: string | null;
    content: string;
    published: boolean;
    publishedAt: string | null;
};

export async function getEditableInfoPage(code: EditableInfoPageCode): Promise<EditableInfoPage> {
    const { data } = await panelHttp.get<EditableInfoPage>(`/panel/content/pages/${code}`);
    return data;
}

export async function saveEditableInfoPage(
    code: EditableInfoPageCode,
    payload: UpsertInfoPageRequest,
): Promise<void> {
    await panelHttp.put(`/panel/content/pages/${code}`, payload);
}

export async function getAdminNews(): Promise<AdminNewsPost[]> {
    const { data } = await panelHttp.get<AdminNewsPost[]>("/panel/content/news");
    return data;
}

export async function createAdminNews(payload: EditableNewsForm): Promise<string> {
    const request: UpsertNewsRequest = {
        title: payload.title,
        excerpt: payload.excerpt.trim() || null,
        content: payload.content,
        published: payload.published,
        publishedAt: null,
    };

    const { data } = await panelHttp.post<string>("/panel/content/news", request);
    return data;
}

export async function updateAdminNews(id: string, payload: EditableNewsForm): Promise<void> {
    const request: UpsertNewsRequest = {
        title: payload.title,
        excerpt: payload.excerpt.trim() || null,
        content: payload.content,
        published: payload.published,
        publishedAt: null,
    };

    await panelHttp.put(`/panel/content/news/${id}`, request);
}

export async function deleteAdminNews(id: string): Promise<void> {
    await panelHttp.delete(`/panel/content/news/${id}`);
}
