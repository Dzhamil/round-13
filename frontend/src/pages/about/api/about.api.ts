import { http } from "../../../shared/api/http";
import type { InfoPageResponse } from "../model/about.types";

export const aboutApi = {
    async getAboutPage(): Promise<InfoPageResponse> {
        const { data } = await http.get<InfoPageResponse>("/pages/about");
        return data;
    },
};
