import { Button } from "../../../../shared/ui/Button";
import ErrorText from "../../../../shared/ui/ErrorText";
import { BirthDateSelect } from "../components/BirthDateSelect";
import { completeProfilePageStyles as s } from "../../styles/completeProfilePage.styles";
import type { Gender } from "../../../../shared/api/profile.api";

type Props = {
    avatarPreview: string | null;
    onPickAvatarClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (file: File | null) => void;

    gender: Gender | "";
    onGenderChange: (g: Gender) => void;

    nickname: string;
    onNicknameChange: (v: string) => void;

    phone: string;
    onPhoneChange: (v: string) => void;

    birthDateIso: string | null;
    onBirthDateChange: (v: string | null) => void;

    loading: boolean;
    error: string | null;

    onSubmit: () => void;
};

export function CompleteProfilePageView({
                                            avatarPreview,
                                            onPickAvatarClick,
                                            fileInputRef,
                                            onFileChange,

                                            gender,
                                            onGenderChange,

                                            nickname,
                                            onNicknameChange,

                                            phone,
                                            onPhoneChange,

                                            birthDateIso,
                                            onBirthDateChange,

                                            loading,
                                            error,

                                            onSubmit,
                                        }: Props) {
    return (
        <div style={s.root}>
            <div style={s.topRow}>
                <div style={s.titleBlock}>
                    <div style={s.title}>Завершите профиль</div>
                    <div style={s.subtitle}>
                        Заполните данные, чтобы тренер мог подтвердить профиль и открыть доступ к разделам клуба.
                    </div>
                </div>

                <div style={s.avatarBox} onClick={onPickAvatarClick} role="button" tabIndex={0}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Фото профиля" style={s.avatarImg} draggable={false} />
                    ) : (
                        <div style={s.avatarPlaceholder}>Добавить фото</div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                    />
                </div>
            </div>

            <div style={s.panel}>
                <div style={s.field}>
                    <div style={s.label}>Пол</div>
                    <div style={s.genderRow}>
                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "MALE"}
                                onChange={() => onGenderChange("MALE")}
                            />
                            <span style={s.radioText}>Мужской</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "FEMALE"}
                                onChange={() => onGenderChange("FEMALE")}
                            />
                            <span style={s.radioText}>Женский</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "OTHER"}
                                onChange={() => onGenderChange("OTHER")}
                            />
                            <span style={s.radioText}>Другое</span>
                        </label>
                    </div>
                </div>

                <div style={s.field}>
                    <div style={s.label}>Имя или никнейм</div>
                    <input
                        style={s.input}
                        placeholder="Например, Иван"
                        value={nickname}
                        onChange={(e) => onNicknameChange(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div style={s.field}>
                    <div style={s.label}>Телефон</div>
                    <input
                        style={s.input}
                        placeholder="+79991234567"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        inputMode="tel"
                    />
                    <div style={s.help}>
                        Номер нужен для подтверждения профиля, входа в клубный аккаунт и связи по тренировкам.
                    </div>
                </div>

                <div style={s.field}>
                    <BirthDateSelect
                        label="Дата рождения"
                        value={birthDateIso}
                        onChange={onBirthDateChange}
                    />
                </div>

                <div style={{ marginTop: 14 }}>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "Сохраняем..." : "Сохранить профиль"}
                    </Button>
                </div>

                {error && (
                    <div style={{ marginTop: 10 }}>
                        <ErrorText message={error} />
                    </div>
                )}
            </div>
        </div>
    );
}
