import { buildBalanceHistoryTitle, formatDateTime } from "../../model/members.helpers";
import type { TrainingBalanceHistoryItem } from "../../model/members.types";
import { clubMembersPageStyles as s } from "../pages/clubMembersPage.styles";

type Props = {
    item: TrainingBalanceHistoryItem
}

export function MemberHistoryCard({ item }: Props) {
    return (
        <div style={s.historyCard}>
            <div style={s.historyTop}>
                <div>
                    <div style={s.historyTitle}>{buildBalanceHistoryTitle(item)}</div>
                    <div style={s.historyMeta}>{item.studentName}</div>
                </div>
                <div style={s.historyDelta(item.delta > 0)}>
                    {item.delta > 0 ? `+${item.delta}` : item.delta}
                </div>
            </div>
            <div style={s.historyMeta}>Остаток после изменения: {item.balanceAfter}</div>
            <div style={s.historyMeta}>Действие выполнил: {item.createdByName ?? "Сотрудник"}</div>
            <div style={s.historyTime}>{formatDateTime(item.createdAt)}</div>
        </div>
    );
}
