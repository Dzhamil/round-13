// frontend/src/pages/profile/ui/pages/ProfilePage.view.tsx
import { ProfileHeader } from "../components/ProfileHeader/ProfileHeader";
import { ProfileStatsBlock } from "../components/ProfileStatsBlock/ProfileStatsBlock";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";

import { Button } from "../../../../shared/ui/Button";
import { profilePageStyles as s } from "../../styles/profilePage.styles";

type Props = {
    loading: boolean;
    errorText: string | null;

    me: any | null;
    mappedStats: any;

    isEditOpen: boolean;
    onOpenEdit: () => void;
    onCloseEdit: () => void;

    onReload: () => void;
};

export function ProfilePageView({
                                    loading,
                                    errorText,
                                    me,
                                    mappedStats,
                                    isEditOpen,
                                    onOpenEdit,
                                    onCloseEdit,
                                    onReload,
                                }: Props) {
    if (loading) return <div style={s.root}>Загрузка…</div>;
    if (errorText) return <div style={s.root}>{errorText}</div>;
    if (!me) return <div style={s.root}>Не удалось загрузить профиль</div>;

    return (
        <div style={s.root}>
            <ProfileHeader
                avatarUrl={me.avatarUrl ?? undefined}
                name={me.fullName ?? me.nickname ?? "Без имени"}
                gender={me.gender ?? null}
                ratingPlace={mappedStats.ratingPlace ?? null}
                winRatePercent={mappedStats.winRatePercent ?? null}
            />

            <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                    <Button variant="secondary" onClick={onOpenEdit}>
                        НАСТРОЙКИ
                    </Button>
                </div>
            </div>

            <div style={s.card}>
                <div style={s.cardTitle}>Данные</div>

                <div style={s.row}>
                    Ник: <span style={s.value}>{me.nickname ?? "—"}</span>
                </div>

                <div style={s.row}>
                    Телефон: <span style={s.value}>{me.phone ?? "—"}</span>
                </div>

                {me.birthDate ? (
                    <div style={s.row}>
                        Дата рождения: <span style={s.value}>{me.birthDate}</span>
                    </div>
                ) : (
                    <div style={s.rowMuted}>Дата рождения не указана</div>
                )}
            </div>

            <ProfileStatsBlock {...mappedStats} />

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={onCloseEdit}
                current={{
                    nickname: me.nickname,
                    phone: me.phone,
                    gender: me.gender,
                    avatarUrl: me.avatarUrl,
                    birthDate: me.birthDate,
                }}
                onSaved={onReload}
            />
        </div>
    );
}
