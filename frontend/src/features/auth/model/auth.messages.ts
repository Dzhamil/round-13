export const AUTH_MESSAGES = {
    INVALID_PHONE: "Введите корректный номер телефона.",
    INVALID_PHONE_STATE: "Телефон некорректный.",
    EMPTY_CODE: "Введите код из SMS.",

    SEND_CODE_ERROR:
        "Не удалось отправить код. Попробуйте позже.",

    VERIFY_CODE_ERROR:
        "Не удалось подтвердить код. Попробуйте снова.",

    OPEN_IN_TELEGRAM: "Откройте приложение из Telegram.",
    TELEGRAM_INIT_DATA_MISSING:
        "Не удалось подтвердить вход через Telegram. Закройте это окно и откройте приложение из бота еще раз.",
    TELEGRAM_LOGIN_ERROR:
        "Не удалось войти через Telegram. Попробуйте открыть приложение заново или обратитесь в клуб.",
    SMS_LOGIN_DISABLED: "Вход по SMS сейчас недоступен. Откройте приложение через Telegram."
} as const;
