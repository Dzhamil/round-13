package com.round13.backend.module.auth.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TelegramBotWebhookService {

    private static final Logger log = LoggerFactory.getLogger(TelegramBotWebhookService.class);
    private static final String RECOVERY_ACTION = "восстановить пароль";

    private final TelegramContactRecoveryService recoveryService;
    private final TelegramBotGateway botGateway;

    public void handle(TelegramContactWebhookRequest update) {
        TelegramContactWebhookRequest.Message message = update == null ? null : update.message();
        if (message == null || message.chat() == null || message.chat().id() == null) {
            return;
        }

        long chatId = message.chat().id();
        if (message.contact() != null) {
            handleContact(chatId, update);
            return;
        }

        String text = message.text() == null ? "" : message.text().trim().toLowerCase(Locale.ROOT);
        if (text.startsWith("/start")) {
            sendSafely(chatId, () -> botGateway.showMainMenu(chatId));
        } else if (RECOVERY_ACTION.equals(text) || "/recover".equals(text)) {
            sendSafely(chatId, () -> botGateway.requestOwnContact(chatId));
        } else {
            sendSafely(chatId, () -> botGateway.showMainMenu(chatId));
        }
    }

    private void handleContact(long chatId, TelegramContactWebhookRequest update) {
        try {
            recoveryService.acceptVerifiedContact(update);
            sendSafely(chatId, () -> botGateway.showRecoverySuccess(chatId));
        } catch (BusinessException exception) {
            log.info("Telegram contact recovery rejected: {}", exception.getErrorCode());
            sendSafely(chatId, () -> botGateway.showRecoveryFailure(chatId));
        }
    }

    private void sendSafely(long chatId, Runnable sendAction) {
        try {
            sendAction.run();
        } catch (RuntimeException exception) {
            log.error("Failed to send Telegram bot response for chat {}", chatId, exception);
        }
    }
}
