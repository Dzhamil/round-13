package com.round13.backend.module.auth.service;

public interface TelegramBotGateway {

    void showMainMenu(long chatId);

    void requestOwnContact(long chatId);

    void showRecoverySuccess(long chatId);

    void showRecoveryFailure(long chatId);
}
