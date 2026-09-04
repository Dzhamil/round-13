package com.round13.backend.module.auth.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TelegramBotWebhookServiceTest {

    private static final long CHAT_ID = 42L;
    private final TelegramContactRecoveryService recoveryService = mock(TelegramContactRecoveryService.class);
    private final TelegramBotGateway botGateway = mock(TelegramBotGateway.class);
    private final TelegramBotWebhookService service = new TelegramBotWebhookService(recoveryService, botGateway);

    @Test
    void startShowsRecoveryInMainMenu() {
        service.handle(textUpdate("/start recovery"));

        verify(botGateway).showMainMenu(CHAT_ID);
    }

    @Test
    void recoveryActionRequestsOwnContact() {
        service.handle(textUpdate("Восстановить пароль"));

        verify(botGateway).requestOwnContact(CHAT_ID);
    }

    @Test
    void verifiedContactGetsOpenAppAction() {
        TelegramContactWebhookRequest update = contactUpdate();

        service.handle(update);

        verify(recoveryService).acceptVerifiedContact(update);
        verify(botGateway).showRecoverySuccess(CHAT_ID);
    }

    @Test
    void rejectedForeignContactGetsSafeRetryMessage() {
        TelegramContactWebhookRequest update = contactUpdate();
        when(recoveryService.acceptVerifiedContact(update))
                .thenThrow(new BusinessException(ErrorCode.TELEGRAM_CONTACT_NOT_OWNED));

        service.handle(update);

        verify(botGateway).showRecoveryFailure(CHAT_ID);
    }

    @Test
    void telegramApiFailureDoesNotEscapeWebhookHandler() {
        doThrow(new RuntimeException("Telegram API unavailable"))
                .when(botGateway).showMainMenu(CHAT_ID);

        assertDoesNotThrow(() -> service.handle(textUpdate("/start")));
    }

    private TelegramContactWebhookRequest textUpdate(String text) {
        return request(text, null);
    }

    private TelegramContactWebhookRequest contactUpdate() {
        return request(null, new TelegramContactWebhookRequest.Contact("+79393930920", CHAT_ID));
    }

    private TelegramContactWebhookRequest request(String text, TelegramContactWebhookRequest.Contact contact) {
        return new TelegramContactWebhookRequest(new TelegramContactWebhookRequest.Message(
                1L,
                new TelegramContactWebhookRequest.Chat(CHAT_ID),
                new TelegramContactWebhookRequest.From(CHAT_ID),
                text,
                contact
        ));
    }
}
