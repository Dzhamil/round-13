import { http } from "../../../shared/api/http";

type BlockedReason = "missing_surname" | "missing_first_name" | "missing_patronymic"
    | "missing_phone" | "invalid_phone" | "missing_birth_date" | "invalid_birth_date"
    | "missing_gender" | "missing_nickname" | "missing_avatar";

/** Send only a fixed reason code, never form values. Diagnostics must not prevent retry. */
export function reportBlockedProfileSave(reason: BlockedReason): void {
    void http.post("/account/profile/diagnostics", { reason }).catch(() => undefined);
}
