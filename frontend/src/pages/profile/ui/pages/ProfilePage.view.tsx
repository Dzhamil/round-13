// frontend/src/pages/profile/ui/pages/ProfilePage.view.tsx
import { ProfileHeader } from "../components/ProfileHeader/ProfileHeader";
import { ProfileStatsBlock } from "../components/ProfileStatsBlock/ProfileStatsBlock";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";
import { MyEntitlementsBlock } from "../components/MyEntitlementsBlock/MyEntitlementsBlock";
import { ProfileActionButton } from "../components/ProfileActionButton/ProfileActionButton";
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
    if (loading) return <div style={s.status}>Загрузка…</div>;
    if (errorText) return <div style={s.status}>{errorText}</div>;
    if (!me) return <div style={s.status}>Не удалось загрузить профиль</div>;

    return (
        <div style={s.root}>
            <div style={s.hero}>
                <ProfileHeader
                    avatarUrl={me.avatarUrl ?? undefined}
                    name={me.fullName ?? me.nickname ?? "Без имени"}
                    gender={me.gender ?? null}
                    ratingPlace={mappedStats.ratingPlace ?? null}
                    winRatePercent={mappedStats.winRatePercent ?? null}
                />

                <div style={s.toolbar}>
                    <div style={s.toolbarItem}>
                        <ProfileActionButton variant="secondary" onClick={onOpenEdit} fullWidth>
                            Настройки
                        </ProfileActionButton>
                    </div>
                </div>
            </div>

            <div style={s.cardGrid}>
                <div style={s.card}>
                    <div style={s.sectionHeader}>
                        <div style={s.cardTitle}>Данные профиля</div>
                    </div>

                    <div style={s.rows}>
                        <div style={s.row}>
                            <div style={s.rowLabel}>Ник</div>
                            <div style={s.rowValue}>{me.nickname ?? "—"}</div>
                        </div>

                        <div style={s.row}>
                            <div style={s.rowLabel}>Телефон</div>
                            <div style={s.rowValue}>{me.phone ?? "—"}</div>
                        </div>

                        <div style={s.row}>
                            <div style={s.rowLabel}>Дата рождения</div>
                            <div style={s.rowValue}>
                                {me.birthDate ? me.birthDate : <span style={s.rowMuted}>Не указана</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MyEntitlementsBlock items={me.entitlements ?? []} />

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
