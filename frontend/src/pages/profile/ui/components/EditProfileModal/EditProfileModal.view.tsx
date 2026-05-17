import ErrorText from "../../../../../shared/ui/ErrorText";
import { BirthDateSelect } from "../BirthDateSelect";
import { ProfileActionButton } from "../ProfileActionButton/ProfileActionButton";
import { editProfileModalStyles as s } from "../../../styles/editProfileModal.styles";
import type { Gender } from "../../../api/profileUpdate.api";

type Props = {
    isOpen: boolean;
    onClose: () => void;

    nickname: string;
    onNicknameChange: (v: string) => void;

    phone: string;
    onPhoneChange: (v: string) => void;

    phoneHidden: boolean;
    onPhoneHiddenChange: (v: boolean) => void;

    gender: Gender | "";
    onGenderChange: (g: Gender) => void;

    aboutMe: string;
    onAboutMeChange: (v: string) => void;

    avatarPreview: string | null;
    fileRef: React.RefObject<HTMLInputElement | null>;
    onPickAvatar: () => void;
    onFilePick: (file: File | null) => void;

    birthDateIso: string | null;
    onBirthDateChange: (v: string | null) => void;

    loading: boolean;
    error: string | null;

    onSave: () => void;
};

export function EditProfileModalView({
                                         isOpen,
                                         onClose,

                                         nickname,
                                         onNicknameChange,

                                         phone,
                                         onPhoneChange,
                                         phoneHidden,
                                         onPhoneHiddenChange,

                                         gender,
                                         onGenderChange,

                                         aboutMe,
                                         onAboutMeChange,

                                         avatarPreview,
                                         fileRef,
                                         onPickAvatar,
                                         onFilePick,

                                         birthDateIso,
                                         onBirthDateChange,

                                         loading,
                                         error,

                                         onSave,
                                     }: Props) {
    if (!isOpen) return null;

    return (
        <div style={s.backdrop} onClick={onClose} role="presentation">
            <div
                style={s.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div style={s.title}>НАСТРОЙКИ БОЙЦА</div>

                <div style={s.row}>
                    <div style={s.label}>Ник</div>
                    <input
                        style={s.input}
                        value={nickname}
                        onChange={(e) => onNicknameChange(e.target.value)}
                        placeholder="Железный Майк"
                    />
                </div>

                <div style={s.row}>
                    <div style={s.label}>Телефон</div>
                    <input
                        style={s.input}
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={18}
                    />
                    <div style={s.help}>Верификацию сделает тренер.</div>
                </div>

                <div style={s.row}>
                    <label style={s.checkbox}>
                        <input
                            type="checkbox"
                            checked={phoneHidden}
                            onChange={(e) => onPhoneHiddenChange(e.target.checked)}
                        />
                        <span style={s.checkboxText}>Скрывать телефон от других участников</span>
                    </label>
                </div>

                <div style={s.row}>
                    <div style={s.label}>Пол</div>
                    <div style={s.genderRow}>
                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender_edit"
                                checked={gender === "MALE"}
                                onChange={() => onGenderChange("MALE")}
                            />
                            <span style={s.radioText}>М</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender_edit"
                                checked={gender === "FEMALE"}
                                onChange={() => onGenderChange("FEMALE")}
                            />
                            <span style={s.radioText}>Ж</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender_edit"
                                checked={gender === "OTHER"}
                                onChange={() => onGenderChange("OTHER")}
                            />
                            <span style={s.radioText}>??</span>
                        </label>
                    </div>
                </div>

                <div style={s.row}>
                    <div style={s.label}>Аватар</div>

                    <div style={s.avatarRow}>
                        <div style={s.avatarBox}>
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="avatar"
                                    style={s.avatarImg}
                                    draggable={false}
                                />
                            ) : (
                                <div style={s.avatarPlaceholder}>AVATAR</div>
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <ProfileActionButton
                                variant="secondary"
                                onClick={onPickAvatar}
                                disabled={loading}
                                fullWidth
                            >
                                Выбрать файл
                            </ProfileActionButton>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => onFilePick(e.target.files?.[0] ?? null)}
                            />

                            <div style={s.help}>Можно поменять в любой момент.</div>
                        </div>
                    </div>
                </div>

                <div style={s.row}>
                    <BirthDateSelect
                        label="Дата рождения"
                        help="Можешь оставить пустым, заполни, если хочешь."
                        value={birthDateIso}
                        onChange={onBirthDateChange}
                    />
                </div>

                <div style={s.row}>
                    <div style={s.label}>О себе</div>
                    <textarea
                        style={s.textarea}
                        value={aboutMe}
                        onChange={(e) => onAboutMeChange(e.target.value)}
                        maxLength={500}
                        placeholder="Например: готовлюсь к соревнованиям, работаю над выносливостью, берегу колено."
                    />
                    <div style={s.help}>Эта информация будет показана в профиле.</div>
                </div>

                {error && <ErrorText message={error} />}

                <div style={s.actions}>
                    <ProfileActionButton variant="secondary" onClick={onClose} disabled={loading}>
                        Отмена
                    </ProfileActionButton>
                    <ProfileActionButton onClick={onSave} disabled={loading}>
                        {loading ? "Сохраняем..." : "Сохранить"}
                    </ProfileActionButton>
                </div>
            </div>
        </div>
    );
}
