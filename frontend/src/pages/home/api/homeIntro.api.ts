import { http } from "../../../shared/api/http";
import type { MembersListResponse } from "../../members/model/members.types";
import type { InfoPageResponse } from "../../about/model/about.types";

export const homeIntroApi = {
    async getAboutPage(): Promise<InfoPageResponse> {
        const { data } = await http.get<InfoPageResponse>("/pages/about");
        return data;
    },

    async getMembersCount(): Promise<number> {
        const [fightersResponse, coachesResponse] = await Promise.all([
            http.get<MembersListResponse>("/members", { params: { group: "FIGHTERS" } }),
            http.get<MembersListResponse>("/members", { params: { group: "COACHES" } }),
        ]);

        return (fightersResponse.data.items?.length ?? 0) + (coachesResponse.data.items?.length ?? 0);
    },
};
