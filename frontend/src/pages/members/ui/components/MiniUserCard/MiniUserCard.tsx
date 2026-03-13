// frontend/src/pages/members/ui/components/MiniUserCard/MiniUserCard.tsx
import type { MemberListItem } from "../../../model/members.types";
import {
    Root,
    AvatarWrap,
    AvatarImg,
    AvatarFallback,
    Info,
    Nickname,
    PhoneButton,
    Status,
    StatusLabel,
    MetaText,
    Points,
} from "./miniUserCard.styles";

type MiniUserCardProps = {
    member: MemberListItem;
    onClick?: (member: MemberListItem) => void;
};

function copyToClipboard(text: string) {
    try {
        void navigator.clipboard.writeText(text);
    } catch {
        // ignore
    }
}

function AvatarPart({ avatarUrl, nickname }: { avatarUrl: string | null; nickname: string | null }) {
    return (
        <AvatarWrap>
            {avatarUrl ? (
                <AvatarImg src={avatarUrl} alt={nickname ?? "avatar"} draggable={false} />
            ) : (
                <AvatarFallback>{String((nickname ?? "?").slice(0, 2)).toUpperCase()}</AvatarFallback>
            )}
        </AvatarWrap>
    );
}

function InfoPart({ nickname, phone }: { nickname: string | null; phone: string | null }) {
    const hasPhone = Boolean(phone);

    return (
        <Info>
            <Nickname>{nickname ?? "Без ника"}</Nickname>

            <PhoneButton
                type="button"
                $hasPhone={hasPhone}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!phone) return;
                    copyToClipboard(phone);
                }}
                title={hasPhone ? "Нажми, чтобы скопировать телефон" : ""}
            >
                {phone ?? "Телефон не указан"}
            </PhoneButton>
        </Info>
    );
}

function StatusPart({
    statusLabel,
    points,
    remainingTrainings,
}: {
    statusLabel: string;
    points: number;
    remainingTrainings: number | null;
}) {
    return (
        <Status>
            <StatusLabel>{statusLabel}</StatusLabel>
            {remainingTrainings != null ? <MetaText>Осталось: {remainingTrainings}</MetaText> : null}
            <Points>{points} очков</Points>
        </Status>
    );
}

export function MiniUserCard({ member, onClick }: MiniUserCardProps) {
    return (
        <Root type="button" onClick={() => onClick?.(member)}>
            <AvatarPart avatarUrl={member.avatarUrl} nickname={member.nickname} />
            <InfoPart nickname={member.nickname} phone={member.phone} />
            <StatusPart
                statusLabel={member.statusLabel}
                points={member.points}
                remainingTrainings={member.remainingTrainings}
            />
        </Root>
    );
}
