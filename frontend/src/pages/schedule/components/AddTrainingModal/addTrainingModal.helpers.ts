import type { MemberListItem } from "../../../../members/model/members.types";

export function formatTrainerOptionLabel(trainer: MemberListItem): string {
    return trainer.nickname || trainer.phone || trainer.id;
}
