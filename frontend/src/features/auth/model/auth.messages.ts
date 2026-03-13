export const AUTH_MESSAGES = {
    INVALID_PHONE: "Введите корректный номер телефона.",
    INVALID_PHONE_STATE: "Телефон некорректный.",
    EMPTY_CODE: "Введите код из SMS.",

    SEND_CODE_ERROR:
        "Не удалось отправить код. Попробуйте позже.",

    VERIFY_CODE_ERROR:
        "Не удалось подтвердить код. Попробуйте снова."
} as const;
