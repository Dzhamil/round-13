import { useState } from "react";

import * as S from "../../styles/AdminUsersPage.styles";

export type IssuedPasswordNoticeProps = {
    password: string;
    onDismiss?: () => void;
};

export function IssuedPasswordNotice({ password, onDismiss }: IssuedPasswordNoticeProps) {
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

    async function copyPassword(): Promise<void> {
        try {
            await navigator.clipboard.writeText(password);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("failed");
        }
    }

    return (
        <S.PasswordNotice role="status">
            <S.PasswordText>
                Временный пароль (показывается один раз): <code>{password}</code>
            </S.PasswordText>
            <S.PasswordActions>
                <button type="button" onClick={() => void copyPassword()}>
                    {copyStatus === "copied" ? "Скопировано" : "Скопировать пароль"}
                </button>
                {onDismiss && (
                    <button type="button" onClick={onDismiss}>
                        Закрыть
                    </button>
                )}
            </S.PasswordActions>
            {copyStatus === "failed" && (
                <S.CopyError>Не удалось скопировать. Выделите пароль и скопируйте вручную.</S.CopyError>
            )}
        </S.PasswordNotice>
    );
}
