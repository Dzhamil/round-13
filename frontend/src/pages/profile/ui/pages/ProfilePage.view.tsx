// frontend/src/pages/profile/ui/pages/ProfilePage.view.tsx
import type { MeResponse } from "../../../../shared/api/account.api";
import { getPhoneDisplayText } from "../../../../shared/lib/phone";
import { ProfileHeader } from "../components/ProfileHeader/ProfileHeader";
import { ProfileAboutSection } from "../components/ProfileAboutSection";
import { ProfileStatsBlock } from "../components/ProfileStatsBlock/ProfileStatsBlock";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";
import { MyEntitlementsBlock } from "../components/MyEntitlementsBlock/MyEntitlementsBlock";
import { ProfileActionButton } from "../components/ProfileActionButton/ProfileActionButton";
import { DeleteAccountModal } from "../components/DeleteAccountModal/DeleteAccountModal";
import { ProfileBoxerPotentialBlock } from "../components/ProfileBoxerPotentialBlock/ProfileBoxerPotentialBlock";
import { profilePageStyles as s } from "../../styles/profilePage.styles";
import {
    formatPhoneVisibility,
    formatProfileBirthDate,
    isDuplicateProfileAlias,
} from "../../model/profileDisplay";

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
    if (loading) return <div style={s.status}>Загрузка...</div>;
    if (errorText) return <div style={s.status}>{errorText}</div>;
    if (!me) return <div style={s.status}>Не удалось загрузить профиль</div>;

    const displayName = me.fullName ?? me.nickname ?? "Без имени";
    const nicknameInfoItem = isDuplicateProfileAlias(displayName, me.nickname)
        ? []
        : [{ label: "Ник", value: me.nickname ?? "Не указан" }];
    const compactInfoItems = [
        ...nicknameInfoItem,
        { label: "Телефон", value: getPhoneDisplayText(me.phone, false) },
        {
            label: "Видимость",
            value: formatPhoneVisibility(me.phoneHidden),
        },
        {
            label: "Дата рождения",
            value: formatProfileBirthDate(me.birthDate),
        },
    ];

    return (
        <div style={s.root}>
            <div style={s.hero}>
                <ProfileHeader
                    avatarUrl={me.avatarUrl ?? undefined}
                    name={displayName}
                    gender={me.gender ?? null}
                    ratingPlace={mappedStats.ratingPlace ?? null}
                    winRatePercent={mappedStats.winRatePercent ?? null}
                    infoItems={compactInfoItems}
                />

                <div style={s.toolbar}>
                    <div style={s.toolbarItem}>
                        <ProfileActionButton variant="secondary" size="compact" onClick={onOpenEdit}>
                            Настройки
                        </ProfileActionButton>
                    </div>
                </div>
            </div>

            <div style={s.cardGrid}>
                <ProfileAboutSection me={me} />
            </div>

            <MyEntitlementsBlock items={me.entitlements ?? []} />

            <ProfileStatsBlock {...mappedStats} />

            <ProfileBoxerPotentialBlock memberId={me.id} />

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
                    phoneHidden: me.phoneHidden,
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
