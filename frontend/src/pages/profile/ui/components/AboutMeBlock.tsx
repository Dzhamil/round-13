// frontend/src/pages/profile/ui/components/AboutMeBlock.tsx
import { useState } from "react";
import { updateAboutMe } from "../../../../shared/api/profile.api";
import type { MeResponse } from "../../../../shared/api/account.api";
import {
    Container,
    TextArea,
    SaveButton,
    Title
} from "./aboutMeBlock.styles";

type Props = {
    me: MeResponse;
    onUpdated: (updated: MeResponse) => void;
};

export function AboutMeBlock({ me, onUpdated }: Props) {
    const [value, setValue] = useState(me.aboutMe ?? "");
    const [loading, setLoading] = useState(false);

    if (!me.phoneVerifiedByStaff) {
        return null;
    }

    async function handleSave() {
        setLoading(true);
        const updated = await updateAboutMe({ aboutMe: value || null });
        onUpdated(updated);
        setLoading(false);
    }

    return (
        <Container>
            <Title>О себе</Title>
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={500}
            />
            <SaveButton disabled={loading} onClick={handleSave}>
                Сохранить
            </SaveButton>
        </Container>
    );
}
