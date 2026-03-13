import type { ReactNode } from "react";

import { schedulePageStyles as s } from "../schedulePage.styles";

export function ScheduleModalShell({ children }: { children: ReactNode }) {
    return (
        <div style={s.modalBackdrop}>
            <div style={s.modal}>{children}</div>
        </div>
    );
}
