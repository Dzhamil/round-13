// frontend/src/pages/profile/ui/pages/CompleteProfilePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { completeProfile, type Gender } from "../../../../shared/api/profile.api";
import { AuthRequiredError } from "../../../../shared/api/http";
import { maskRussianPhoneInput, normalizeRussianPhone } from "../../../../shared/lib/phone";
import { getMe } from "../../../../shared/api/account.api";
import { isProfileComplete } from "../../lib/profile.completeness";
import Loader from "../../../../shared/ui/Loader/Loader";
import { CompleteProfilePageView } from "./CompleteProfilePage.view";

function getTelegramPhotoUrl(): string | null {
    try {
        const w: any = window as any;
        return w?.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url ?? null;
    } catch {
        return null;
    }
}

function getTelegramUsername(): string | null {
    try {
        const w: any = window as any;
        return w?.Telegram?.WebApp?.initDataUnsafe?.user?.username ?? null;
    } catch {
        return null;
    }
}

function getTelegramPhoneHint(): string | null {
    return null;
}

export function CompleteProfilePage() {
    const navigate = useNavigate();

    const tgPhotoUrl = useMemo(() => getTelegramPhotoUrl(), []);
    const tgUsername = useMemo(() => getTelegramUsername(), []);
    const tgPhoneHint = useMemo(() => getTelegramPhoneHint(), []);

    const [surname, setSurname] = useState("");
    const [firstName, setFirstName] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [gender, setGender] = useState<Gender | "">("");
    const [nickname, setNickname] = useState(tgUsername ?? "");
    const [phone, setPhone] = useState(maskRussianPhoneInput(tgPhoneHint ?? ""));
    const [phoneHidden, setPhoneHidden] = useState(false);

    const [birthDateIso, setBirthDateIso] = useState<string | null>(null);

    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [initializing, setInitializing] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    useEffect(() => {
        let active = true;
        getMe().then(me => {
            if (!active) return;
            setSurname(me.surname ?? "");
            setFirstName(me.firstName ?? "");
            setPatronymic(me.patronymic ?? "");
            setGender(me.gender ?? "");
            setNickname(me.nickname ?? tgUsername ?? "");
            setPhone(maskRussianPhoneInput(me.phone ?? ""));
            setPhoneHidden(Boolean(me.phoneHidden));
            setBirthDateIso(me.birthDate ?? null);
            setAvatarDataUrl(me.avatarUrl ?? null);
            setMissingFields(me.profileMissingFields ?? []);
        }).catch(() => {
            if (active) {
                setLoadFailed(true);
                setError("Не удалось загрузить профиль. Вернитесь в меню и попробуйте снова.");
            }
        }).finally(() => { if (active) setInitializing(false); });
        return () => { active = false; };
    }, [tgUsername]);

    const avatarPreview = avatarDataUrl ?? tgPhotoUrl ?? null;

    function onPickAvatarClick(): void {
        fileInputRef.current?.click();
    }

    async function onFileChange(file: File | null): Promise<void> {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Можно загрузить только изображение.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : null;
            setAvatarDataUrl(result);
        };
        reader.readAsDataURL(file);
    }

    async function submit() {
        setError(null);

        if (![surname, firstName, patronymic].every(value => value.trim())) {
            return setError("Заполните фамилию, имя и отчество.");
        }
        const normalizedNick = nickname.trim();
        const normalizedPhone = normalizeRussianPhone(phone);
        const hasPhoneInput = phone.trim().length > 0;

        if (!hasPhoneInput) return setError("Введите номер телефона в формате +7XXXXXXXXXX.");
        if (!normalizedPhone) return setError("Проверьте номер: нужен российский номер в формате +79991234567.");
        if (!birthDateIso) return setError("Укажите дату рождения.");
        if (!gender) return setError("Выберите пол.");
        if (!normalizedNick) return setError("Введите никнейм.");

        const avatarUrl = avatarDataUrl ?? tgPhotoUrl ?? "";
        if (!avatarUrl) return setError("Добавьте фото профиля.");

        setLoading(true);
        try {
            const saved = await completeProfile({
                surname: surname.trim(),
                firstName: firstName.trim(),
                patronymic: patronymic.trim(),
                nickname: normalizedNick,
                phone: normalizedPhone,
                phoneHidden,
                gender: gender as Gender,
                avatarUrl,
                birthDate: birthDateIso ?? null,
            });

            setMissingFields(saved.profileMissingFields ?? []);
            if (isProfileComplete(saved)) {
                navigate("/", { replace: true });
            } else {
                setError("Профиль сохранён. Заполните недостающие обязательные поля.");
            }
        } catch (e: any) {
            setError(e instanceof AuthRequiredError
                ? "Сессия истекла. Войдите снова, чтобы сохранить профиль."
                : e?.response?.data?.message ?? "Не удалось сохранить профиль. Попробуйте еще раз.");
        } finally {
            setLoading(false);
        }
    }

    if (initializing) return <Loader text="Загружаем профиль..." />;

    return (
        <>
            <Link to="/">В главное меню</Link>
            <CompleteProfilePageView
                missingFields={missingFields}
                surname={surname} onSurnameChange={setSurname}
                firstName={firstName} onFirstNameChange={setFirstName}
                patronymic={patronymic} onPatronymicChange={setPatronymic}
                avatarPreview={avatarPreview}
                onPickAvatarClick={onPickAvatarClick}
                fileInputRef={fileInputRef}
                onFileChange={(f) => void onFileChange(f)}
                gender={gender}
                onGenderChange={setGender}
                nickname={nickname}
                onNicknameChange={setNickname}
                phone={phone}
                onPhoneChange={(value) => setPhone(maskRussianPhoneInput(value))}
                phoneHidden={phoneHidden}
                onPhoneHiddenChange={setPhoneHidden}
                birthDateIso={birthDateIso}
                onBirthDateChange={setBirthDateIso}
                loading={loading || loadFailed}
                error={error}
                onSubmit={() => void submit()}
            />
        </>
    );
}
