import type { ReactNode } from "react";

import { schedulePageStyles as s } from "../schedulePage.styles";

export function SchedulePageShell({ children }: { children: ReactNode }) {
    return <div style={s.root}>{children}</div>;
}
