// frontend/src/pages/profile/ui/pages/ProfilePage.view.tsx
import type { MeResponse } from "../../../../shared/api/account.api";
import { ProfileHeader } from "../components/ProfileHeader/ProfileHeader";
import { ProfileAboutSection } from "../components/ProfileAboutSection";
import { ProfileStatsBlock } from "../components/ProfileStatsBlock/ProfileStatsBlock";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";
import { MyEntitlementsBlock } from "../components/MyEntitlementsBlock/MyEntitlementsBlock";
import { ProfileActionButton } from "../components/ProfileActionButton/ProfileActionButton";
import { DeleteAccountModal } from "../components/DeleteAccountModal/DeleteAccountModal";
import { profilePageStyles as s } from "../../styles/profilePage.styles";

type Props = {
    loading: boolean;
    errorText: string | null;

    me: MeResponse | null;
    mappedStats: any;

    isEditOpen: boolean;
    isDeleteOpen: boolean;
    deleteConfirmed: boolean;
    deleteLoading: boolean;
    deleteError: string | null;
    onOpenEdit: () => void;
    onCloseEdit: () => void;
    onOpenDelete: () => void;
    onCloseDelete: () => void;
    onDeleteConfirmedChange: (confirmed: boolean) => void;
    onConfirmDelete: () => void;

    onReload: () => void;
};

export function ProfilePageView({
                                    loading,
                                    errorText,
                                    me,
                                    mappedStats,
                                    isEditOpen,
                                    isDeleteOpen,
                                    deleteConfirmed,
                                    deleteLoading,
                                    deleteError,
                                    onOpenEdit,
                                    onCloseEdit,
                                    onOpenDelete,
                                    onCloseDelete,
                                    onDeleteConfirmedChange,
                                    onConfirmDelete,
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

                <ProfileAboutSection me={me} />

            </div>

            <MyEntitlementsBlock items={me.entitlements ?? []} />

            <ProfileStatsBlock {...mappedStats} />

            <div style={s.dangerCard}>
                <div style={s.sectionHeader}>
                    <div style={s.cardTitle}>Опасная зона</div>
                </div>
                <p style={s.dangerText}>
                    Деактивация скрывает профиль из обычных списков и завершает текущий доступ.
                </p>
                <ProfileActionButton variant="danger" onClick={onOpenDelete} fullWidth>
                    Деактивировать профиль
                </ProfileActionButton>
            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={onCloseEdit}
                current={{
                    nickname: me.nickname,
                    phone: me.phone,
                    gender: me.gender,
                    avatarUrl: me.avatarUrl,
                    birthDate: me.birthDate,
                    aboutMe: me.aboutMe,
                }}
                onSaved={onReload}
            />

            <DeleteAccountModal
                isOpen={isDeleteOpen}
                confirmed={deleteConfirmed}
                loading={deleteLoading}
                error={deleteError}
                onConfirmedChange={onDeleteConfirmedChange}
                onClose={onCloseDelete}
                onConfirm={onConfirmDelete}
            />
        </div>
    );
}
