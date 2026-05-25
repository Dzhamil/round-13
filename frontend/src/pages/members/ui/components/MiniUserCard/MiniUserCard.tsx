// frontend/src/pages/members/ui/components/MiniUserCard/MiniUserCard.tsx
import { getPhoneDisplayText } from "../../../../../shared/lib/phone";
import type { MemberListItem } from "../../../model/members.types";
import {
    Root,
    CardAction,
    CardContent,
    AvatarWrap,
    AvatarImg,
    AvatarFallback,
    Info,
    Nickname,
    PhoneButton,
    PhoneText,
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

function InfoPart({
    nickname,
    phone,
    phoneHidden,
}: {
    nickname: string | null;
    phone: string | null;
    phoneHidden: boolean;
}) {
    const hasVisiblePhone = Boolean(phone && !phoneHidden);
    const phoneText = getPhoneDisplayText(phone, phoneHidden);

    return (
        <Info>
            <Nickname>{nickname ?? "Без ника"}</Nickname>

            {hasVisiblePhone && phone ? (
                <PhoneButton
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(phone);
                    }}
                    title="Нажми, чтобы скопировать телефон"
                    aria-label={`Скопировать телефон ${phoneText}`}
                >
                    {phoneText}
                </PhoneButton>
            ) : (
                <PhoneText>{phoneText}</PhoneText>
            )}
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
        <Root $clickable={Boolean(onClick)}>
            {onClick ? (
                <CardAction
                    type="button"
                    onClick={() => onClick(member)}
                    aria-label={`Открыть карточку ${member.nickname ?? "участника"}`}
                />
            ) : null}
            <CardContent>
                <AvatarPart avatarUrl={member.avatarUrl} nickname={member.nickname} />
                <InfoPart nickname={member.nickname} phone={member.phone} phoneHidden={member.phoneHidden} />
                <StatusPart
                    statusLabel={member.statusLabel}
                    points={member.points}
                    remainingTrainings={member.remainingTrainings}
                />
            </CardContent>
        </Root>
    );
}
