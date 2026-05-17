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

    phoneHidden: boolean;
    onPhoneHiddenChange: (v: boolean) => void;

    birthDateIso: string | null;
    onBirthDateChange: (v: string | null) => void;

    loading: boolean;
    error: string | null;

    onSubmit: () => void;
};

function genderToast(g: Gender) {
    if (g === "MALE") alert("Рама! Мощь! Сила!");
    if (g === "FEMALE") alert("Женщины тоже люди");
    if (g === "OTHER") alert("Скорлупа ебаная, дядя Вова вас отменил!");
}

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
                                            phoneHidden,
                                            onPhoneHiddenChange,

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
                    <div style={s.title}>ИИИИУУУ!!!</div>
                    <div style={s.subtitle}>Заполни профиль, Пэпэ Вата Фа.</div>
                </div>

                <div style={s.avatarBox} onClick={onPickAvatarClick} role="button" tabIndex={0}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" style={s.avatarImg} draggable={false} />
                    ) : (
                        <div style={s.avatarPlaceholder}>AVATAR</div>
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
                    <div style={s.label}>Кто по жизни?</div>
                    <div style={s.genderRow}>
                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "MALE"}
                                onChange={() => {
                                    onGenderChange("MALE");
                                    genderToast("MALE");
                                }}
                            />
                            <span style={s.radioText}>М</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "FEMALE"}
                                onChange={() => {
                                    onGenderChange("FEMALE");
                                    genderToast("FEMALE");
                                }}
                            />
                            <span style={s.radioText}>Ж</span>
                        </label>

                        <label style={s.radio}>
                            <input
                                type="radio"
                                name="gender"
                                checked={gender === "OTHER"}
                                onChange={() => {
                                    onGenderChange("OTHER");
                                    genderToast("OTHER");
                                }}
                            />
                            <span style={s.radioText}>??</span>
                        </label>
                    </div>
                </div>

                <div style={s.field}>
                    <div style={s.label}>Как зовут эту машину?</div>
                    <input
                        style={s.input}
                        placeholder="Железный Майк"
                        value={nickname}
                        onChange={(e) => onNicknameChange(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div style={s.field}>
                    <div style={s.label}>Кинь цифры братух</div>
                    <input
                        style={s.input}
                        placeholder="+7 (999) 123-45-67"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={18}
                    />
                    <div style={s.help}>
                        Верификацию сделает тренер после подтверждения. Пока просто введи номер.
                    </div>
                </div>

                <div style={s.field}>
                    <label style={s.checkbox}>
                        <input
                            type="checkbox"
                            checked={phoneHidden}
                            onChange={(e) => onPhoneHiddenChange(e.target.checked)}
                        />
                        <span style={s.checkboxText}>Скрывать телефон от других участников</span>
                    </label>
                </div>

                <div style={s.field}>
                    <BirthDateSelect
                        label="Че когда днюху отмечаем?"
                        value={birthDateIso}
                        onChange={onBirthDateChange}
                    />
                </div>

                <div style={{ marginTop: 14 }}>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "СОХРАНЯЕМ..." : "ПОГНАЛИ"}
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
