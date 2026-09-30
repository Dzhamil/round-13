import { reportBlockedProfileSave } from "../../../api/profileDiagnostics.api";
// frontend/src/pages/profile/ui/components/EditProfileModal/EditProfileModal.tsx
import { hasRoleValue } from "../../../../../shared/lib/roles";
import { useEffect, useMemo, useRef, useState } from "react";

import { updateMyProfile, uploadMyProfileAvatar, type Gender } from "../../../api/profileUpdate.api";
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

const AVATAR_MAX_EDGE = 1024;
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_OUTPUT_TYPE = "image/jpeg";
const AVATAR_QUALITY_STEPS = [0.86, 0.78, 0.7, 0.62];

async function prepareAvatarFile(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Нужна картинка.");
    }

    const image = await loadImage(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) {
        throw new Error("Не удалось прочитать фотографию.");
    }

    const scale = Math.min(1, AVATAR_MAX_EDGE / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Не удалось подготовить фотографию.");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    for (const quality of AVATAR_QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, AVATAR_OUTPUT_TYPE, quality);
        if (blob.size <= AVATAR_MAX_BYTES) {
            return new File([blob], "avatar.jpg", { type: AVATAR_OUTPUT_TYPE });
        }
    }

    throw new Error("Фотография слишком большая. Выберите файл до 5 МБ.");
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Не удалось прочитать фотографию."));
        };
        image.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Не удалось подготовить фотографию."));
            }
        }, type, quality);
    });
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

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

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

        setAvatarFile(null);
        setAvatarPreviewUrl(null);
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, current]);

    useEffect(() => () => {
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    }, [avatarPreviewUrl]);

    const avatarPreview = useMemo(
        () => avatarPreviewUrl ?? current.avatarUrl ?? null,
        [avatarPreviewUrl, current.avatarUrl],
    );

    function onPickAvatar(): void {
        fileRef.current?.click();
    }

    async function onFilePick(file: File | null) {
        if (!file) return;
        setError(null);
        try {
            const prepared = await prepareAvatarFile(file);
            setAvatarFile(prepared);
            setAvatarPreviewUrl(URL.createObjectURL(prepared));
        } catch (e: any) {
            setAvatarFile(null);
            setAvatarPreviewUrl(null);
            setError(e?.message ?? "Не удалось подготовить фотографию.");
        }
    }

    async function save() {
        setError(null);

        if (loading) return;
        const nick = nickname.trim();
        const ph = normalizeRussianPhone(phone);
        const blocked = (reason: Parameters<typeof reportBlockedProfileSave>[0], message: string) => {
            setError(message);
            reportBlockedProfileSave(reason);
        };
        if (!surname.trim()) return blocked("missing_surname", "Заполните фамилию, имя и отчество.");
        if (!firstName.trim()) return blocked("missing_first_name", "Заполните фамилию, имя и отчество.");
        if (!patronymic.trim()) return blocked("missing_patronymic", "Заполните фамилию, имя и отчество.");
        if (!phone.trim()) return blocked("missing_phone", "Укажите телефон.");
        if (!ph) return blocked("invalid_phone", "Введите телефон в формате +7 (999) 123-45-67.");
        if (birthDateIso && new Date(birthDateIso + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0))) {
            return blocked("invalid_birth_date", "Дата рождения должна быть в прошлом.");
        }

        setLoading(true);
        try {
            await updateMyProfile({
                surname:surname.trim(),firstName:firstName.trim(),patronymic:patronymic.trim(),
                nickname: nick,
                phone: ph,
                phoneHidden,
                gender: gender || undefined,
                ...(canEditAbout ? { aboutMe: aboutMe.trim() || null } : {}),
                birthDate: birthDateIso ?? null,
            });
            if (avatarFile) {
                try {
                    await uploadMyProfileAvatar(avatarFile);
                } catch (e: any) {
                    onSaved();
                    setError(e?.response?.data?.message ?? "Данные профиля сохранены, но фото не загрузилось.");
                    return;
                }
            }

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
