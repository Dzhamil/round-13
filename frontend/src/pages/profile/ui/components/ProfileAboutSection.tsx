import type { MeResponse } from "../../../../shared/api/account.api";
import { profilePageStyles as s } from "../../styles/profilePage.styles";

type Props = {
    me: MeResponse;
};

export function ProfileAboutSection({ me }: Props) {
    const text = me.aboutMe?.trim();

    return (
        <div style={s.card}>
            <div style={s.sectionHeader}>
                <div style={s.cardTitle}>О себе</div>
            </div>

            <div style={s.rows}>
                <div style={s.row}>
                    <div style={s.rowValue}>
                        {text ? text : <span style={s.rowMuted}>Пока ничего не заполнено. Отредактировать можно в настройках профиля.</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
