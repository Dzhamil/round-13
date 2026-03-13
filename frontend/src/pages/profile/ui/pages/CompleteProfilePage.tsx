// frontend/src/pages/profile/ui/pages/CompleteProfilePage.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeProfile, type Gender } from "../../../../shared/api/profile.api";
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

function normalizePhone(raw: string): string {
    const s = (raw ?? "").trim();
    if (!s) return "";

    const digits = s.replace(/\D/g, "");

    // 10 цифр, начинается с 9 => считаем что это РФ мобилка без кода => +7XXXXXXXXXX
    if (digits.length === 10 && digits.startsWith("9")) {
        return `+7${digits}`;
    }

    // 11 цифр, начинается с 7 => +7XXXXXXXXXX
    if (digits.length === 11 && digits.startsWith("7")) {
        return `+${digits}`;
    }

    // (по желанию) 11 цифр, начинается с 8 => +7XXXXXXXXXX
    if (digits.length === 11 && digits.startsWith("8")) {
        return `+7${digits.slice(1)}`;
    }

    // если уже ввели +7... в виде digits=7...
    if (digits.length === 11 && digits.startsWith("7")) {
        return `+${digits}`;
    }

    return "";
}


export function CompleteProfilePage() {
    const navigate = useNavigate();

    const tgPhotoUrl = useMemo(() => getTelegramPhotoUrl(), []);
    const tgUsername = useMemo(() => getTelegramUsername(), []);
    const tgPhoneHint = useMemo(() => getTelegramPhoneHint(), []);

    const [gender, setGender] = useState<Gender | "">("");
    const [nickname, setNickname] = useState(tgUsername ?? "");
    const [phone, setPhone] = useState(tgPhoneHint ?? "");

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
        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) return setError("Кинь норм цифры: +7XXXXXXXXXX или 7XXXXXXXXXX или 9XXXXXXXXX");
        if (!/^\+7\d{10}$/.test(normalizedPhone)) {
            return setError("Номер кривой. Примеры: +79991234567 / 79991234567 / 9991234567");
        }


        if (!gender) return setError("Сначала пол. Иначе никак.");
        if (!normalizedNick) return setError("Как зовут эту машину? Ник обязателен.");
        if (!normalizedPhone) return setError("Номер телефона обязателен.");

        const avatarUrl = avatarDataUrl ?? tgPhotoUrl ?? "";
        if (!avatarUrl) return setError("Аватар обязателен. Жми на квадрат → выбери файл.");

        setLoading(true);
        try {
            await completeProfile({
                nickname: normalizedNick,
                phone: normalizedPhone,
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
            onPhoneChange={setPhone}
            birthDateIso={birthDateIso}
            onBirthDateChange={setBirthDateIso}
            loading={loading}
            error={error}
            onSubmit={() => void submit()}
        />
    );
}
