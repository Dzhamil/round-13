// frontend/src/pages/profile/ui/components/EditProfileModal/EditProfileModal.tsx
import { hasRoleValue } from "../../../../../shared/lib/roles";
import { useEffect, useMemo, useRef, useState } from "react";

import { updateMyProfile, type Gender } from "../../../api/profileUpdate.api";
import { maskRussianPhoneInput, normalizeRussianPhone } from "../../../../../shared/lib/phone";
import { EditProfileModalView } from "./EditProfileModal.view";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    current: {
        surname?: string | null;
        firstName?: string | null;
        patronymic?: string | null;
        nickname?: string | null;
        phone?: string | null;
        phoneHidden?: boolean | null;
        gender?: Gender | string | null;
        avatarUrl?: string | null;
        birthDate?: string | null;
        role: string;
        aboutMe?: string | null;
    };
    onSaved: () => void;
};

function mapGender(g?: string | null): Gender | "" {
    const v = (g ?? "").toUpperCase();
    if (v === "MALE" || v === "FEMALE" || v === "OTHER") return v as Gender;
    return "";
}

export function EditProfileModal({ isOpen, onClose, current, onSaved }: Props) {
    const canEditAbout = hasRoleValue([current.role], "COACH");
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [nickname, setNickname] = useState(current.nickname ?? "");
    const [surname,setSurname]=useState(current.surname??"");
    const [firstName,setFirstName]=useState(current.firstName??"");
    const [patronymic,setPatronymic]=useState(current.patronymic??"");
    const [phone, setPhone] = useState(maskRussianPhoneInput(current.phone ?? ""));
    const [phoneHidden, setPhoneHidden] = useState(Boolean(current.phoneHidden));
    const [gender, setGender] = useState<Gender | "">(mapGender(current.gender as any));
    const [birthDateIso, setBirthDateIso] = useState<string | null>(current.birthDate ?? null);
    const [aboutMe, setAboutMe] = useState(current.aboutMe ?? "");

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
        setSurname(current.surname??"");setFirstName(current.firstName??"");setPatronymic(current.patronymic??"");
        setPhone(maskRussianPhoneInput(current.phone ?? ""));
        setPhoneHidden(Boolean(current.phoneHidden));
        setGender(mapGender(current.gender as any));
        setBirthDateIso(current.birthDate ?? null);
        setAboutMe(current.aboutMe ?? "");

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
        const ph = normalizeRussianPhone(phone);

        if (!nick) return setError("Ник обязателен.");
        if (!ph) return setError("Введите телефон в формате +7 (999) 123-45-67.");
        if (!gender) return setError("Пол обязателен.");

        setLoading(true);
        try {
            await updateMyProfile({
                surname:surname.trim(),firstName:firstName.trim(),patronymic:patronymic.trim()||null,
                nickname: nick,
                phone: ph,
                phoneHidden,
                gender: gender as Gender,
                ...(canEditAbout ? { aboutMe: aboutMe.trim() || null } : {}),
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
            surname={surname} firstName={firstName} patronymic={patronymic}
            onSurnameChange={setSurname} onFirstNameChange={setFirstName} onPatronymicChange={setPatronymic}
            phone={phone}
            onPhoneChange={(value) => setPhone(maskRussianPhoneInput(value))}
            phoneHidden={phoneHidden}
            onPhoneHiddenChange={setPhoneHidden}
            gender={gender}
            onGenderChange={setGender}
            canEditAbout={canEditAbout}
            aboutMe={aboutMe}
            onAboutMeChange={setAboutMe}
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
