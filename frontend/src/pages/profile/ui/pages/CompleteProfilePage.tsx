// frontend/src/pages/profile/ui/pages/CompleteProfilePage.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeProfile, type Gender } from "../../../../shared/api/profile.api";
import { maskRussianPhoneInput, normalizeRussianPhone } from "../../../../shared/lib/phone";
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

    const [gender, setGender] = useState<Gender | "">("");
    const [nickname, setNickname] = useState(tgUsername ?? "");
    const [phone, setPhone] = useState(maskRussianPhoneInput(tgPhoneHint ?? ""));
    const [phoneHidden, setPhoneHidden] = useState(false);

    const [birthDateIso, setBirthDateIso] = useState<string | null>(null);

    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const avatarPreview = avatarDataUrl ?? tgPhotoUrl ?? null;

    function onPickAvatarClick(): void {
        fileInputRef.current?.click();
    }

    async function onFileChange(file: File | null): Promise<void> {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Нужна картинка, брат.");
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

        const normalizedNick = nickname.trim();
        const normalizedPhone = normalizeRussianPhone(phone);

        if (!normalizedPhone) return setError("Введите телефон в формате +7 (999) 123-45-67.");
        if (!gender) return setError("Сначала пол. Иначе никак.");
        if (!normalizedNick) return setError("Как зовут эту машину? Ник обязателен.");

        const avatarUrl = avatarDataUrl ?? tgPhotoUrl ?? "";
        if (!avatarUrl) return setError("Аватар обязателен. Жми на квадрат → выбери файл.");

        setLoading(true);
        try {
            await completeProfile({
                nickname: normalizedNick,
                phone: normalizedPhone,
                phoneHidden,
                gender: gender as Gender,
                avatarUrl,
                birthDate: birthDateIso ?? null,
            });

            navigate("/", { replace: true });
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не сохранилось. Жми ещё раз, солдат.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <CompleteProfilePageView
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
            loading={loading}
            error={error}
            onSubmit={() => void submit()}
        />
    );
}
