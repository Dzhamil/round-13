import { http } from "../../../shared/api/http";
import type { InfoPageResponse } from "../model/about.types";

export const aboutApi = {
    async getPage(code: string): Promise<InfoPageResponse> {
        const { data } = await http.get<InfoPageResponse>(`/pages/${code}`);
        return data;
    },

    async getAboutPage(): Promise<InfoPageResponse> {
        return this.getPage("about");
    },

    async getContactsPage(): Promise<InfoPageResponse> {
        return this.getPage("contacts");
    },

    async getNewcomersPage(): Promise<InfoPageResponse> {
        return this.getPage("newcomers");
    },
};
