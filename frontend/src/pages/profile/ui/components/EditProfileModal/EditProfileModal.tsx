// frontend/src/pages/profile/ui/components/EditProfileModal/EditProfileModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";

import { updateMyProfile, type Gender } from "../../../api/profileUpdate.api";
import { EditProfileModalView } from "./EditProfileModal.view";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    current: {
        nickname?: string | null;
        phone?: string | null;
        gender?: Gender | string | null;
        avatarUrl?: string | null;
        birthDate?: string | null;
    };
    onSaved: () => void;
};

function normalizePhone(raw: string): string {
    const s = raw.trim();
    if (!s) return "";
    if (s.startsWith("+")) return "+" + s.slice(1).replace(/[^\d]/g, "");
    return s.replace(/[^\d]/g, "");
}

function mapGender(g?: string | null): Gender | "" {
    const v = (g ?? "").toUpperCase();
    if (v === "MALE" || v === "FEMALE" || v === "OTHER") return v as Gender;
    return "";
}

export function EditProfileModal({ isOpen, onClose, current, onSaved }: Props) {
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [nickname, setNickname] = useState(current.nickname ?? "");
    const [phone, setPhone] = useState(current.phone ?? "");
    const [gender, setGender] = useState<Gender | "">(mapGender(current.gender as any));
    const [birthDateIso, setBirthDateIso] = useState<string | null>(current.birthDate ?? null);

    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Telegram-like: когда модалка открыта — фон не скроллится
    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        setNickname(current.nickname ?? "");
        setPhone(current.phone ?? "");
        setGender(mapGender(current.gender as any));
        setBirthDateIso(current.birthDate ?? null);

        setAvatarDataUrl(null);
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, current]);

    const avatarPreview = useMemo(
        () => avatarDataUrl ?? current.avatarUrl ?? null,
        [avatarDataUrl, current.avatarUrl],
    );

    function onPickAvatar(): void {
        fileRef.current?.click();
    }

    async function onFilePick(file: File | null) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Нужна картинка.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarDataUrl(typeof reader.result === "string" ? reader.result : null);
        };
        reader.readAsDataURL(file);
    }

    async function save() {
        setError(null);

        const nick = nickname.trim();
        const ph = normalizePhone(phone);

        if (!nick) return setError("Ник обязателен.");
        if (!ph) return setError("Телефон обязателен.");
        if (!gender) return setError("Пол обязателен.");

        setLoading(true);
        try {
            await updateMyProfile({
                nickname: nick,
                phone: ph,
                gender: gender as Gender,
                avatarUrl: avatarDataUrl ?? undefined,
                birthDate: birthDateIso ?? null,
            });

            onClose();
            onSaved();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Не сохранилось.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <EditProfileModalView
            isOpen={isOpen}
            onClose={onClose}
            nickname={nickname}
            onNicknameChange={setNickname}
            phone={phone}
            onPhoneChange={setPhone}
            gender={gender}
            onGenderChange={setGender}
            avatarPreview={avatarPreview}
            fileRef={fileRef}
            onPickAvatar={onPickAvatar}
            onFilePick={(f) => void onFilePick(f)}
            birthDateIso={birthDateIso}
            onBirthDateChange={setBirthDateIso}
            loading={loading}
            error={error}
            onSave={() => void save()}
        />
    );
}
