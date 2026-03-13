import { http } from "../../../shared/api/http";
import type { AboutEditablePageCode, UpsertInfoPagePayload } from "../model/about.types";

export const aboutAdminApi = {
    async upsertPage(code: AboutEditablePageCode, payload: UpsertInfoPagePayload): Promise<void> {
        await http.put(`/admin/pages/${code}`, payload);
    },
};
