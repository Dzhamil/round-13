// frontend/src/pages/profile/ui/components/AboutMeBlock.tsx
import { useEffect, useState } from "react";
import { updateAboutMe } from "../../../../shared/api/profile.api";
import type { MeResponse } from "../../../../shared/api/account.api";
import {
    Container,
    Hint,
    TextArea,
    SaveButton,
} from "./aboutMeBlock.styles";

type Props = {
    me: MeResponse;
    onUpdated: (updated: MeResponse) => void;
};

export function AboutMeBlock({ me, onUpdated }: Props) {
    const [value, setValue] = useState(me.aboutMe ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setValue(me.aboutMe ?? "");
    }, [me.aboutMe]);

    async function handleSave() {
        try {
            setLoading(true);
            setError(null);
            const updated = await updateAboutMe({ aboutMe: value.trim() || null });
            onUpdated(updated);
        } catch {
            setError("Не удалось сохранить информацию о себе");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container>
            <Hint>
                Коротко расскажите о себе, своих целях и ограничениях по тренировкам.
            </Hint>
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={500}
                placeholder="Например: готовлюсь к соревнованиям, работаю над выносливостью, берегу колено."
            />
            {error ? <Hint $error>{error}</Hint> : null}
            <SaveButton disabled={loading || value.trim() === (me.aboutMe ?? "").trim()} onClick={handleSave}>
                {loading ? "Сохраняем…" : "Сохранить"}
            </SaveButton>
        </Container>
    );
}
