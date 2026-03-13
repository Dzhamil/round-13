import React, { useMemo } from "react";
import { appStyles } from "../../../app/app.styles";
import { getTelegramInitData, getTelegramUser, isTelegramWebApp } from "../../../tg";

export default function TgDebugCard() {
    const tg = useMemo(() => {
        const inTg = isTelegramWebApp();
        const initData = getTelegramInitData();
        const user = getTelegramUser();
        return { inTg, initData, user };
    }, []);

    return (
        <div style={appStyles.section}>
            <div>
                <b>Среда:</b> {tg.inTg ? "Telegram WebApp" : "Браузер"}
            </div>

            <div style={appStyles.rowGap8}>
                <b>initData:</b> {tg.initData ? `${tg.initData.slice(0, 60)}...` : "нет"}
            </div>

            <div style={appStyles.rowGap8}>
                <b>Пользователь:</b>{" "}
                {tg.user
                    ? `${tg.user.first_name ?? ""} ${tg.user.last_name ?? ""}`.trim() || `id=${tg.user.id}`
                    : "нет"}
            </div>

            {tg.user?.username && (
                <div style={appStyles.rowGap6}>
                    <b>username:</b> @{tg.user.username}
                </div>
            )}
        </div>
    );
}
