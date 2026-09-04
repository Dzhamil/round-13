package com.round13.backend.module.auth.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TelegramContactRecoveryServiceTest {

    private static final long TELEGRAM_ID = 42L;
    private final UserRepository userRepository = mock(UserRepository.class);
    private final TelegramContactRecoveryService service = new TelegramContactRecoveryService(
            userRepository, new RussianPhoneNormalizer());

    @Test
    void linksOwnTelegramContactToExistingWebUser() {
        UserEntity user = webUser(null);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));

        TelegramContactRecoveryResult result = service.acceptVerifiedContact(
                request(TELEGRAM_ID, TELEGRAM_ID, "8 (939) 393-09-20"));

        assertThat(result).isEqualTo(TelegramContactRecoveryResult.LINKED);
        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
    }

    @Test
    void ignoresContactThatDoesNotBelongToSender() {
        TelegramContactRecoveryResult result = service.acceptVerifiedContact(
                request(TELEGRAM_ID, 99L, "+79393930920"));

        assertThat(result).isEqualTo(TelegramContactRecoveryResult.IGNORED_INVALID_CONTACT);
        verify(userRepository, never()).findByPhone("+79393930920");
    }

    @Test
    void ignoresAccountLinkedToAnotherTelegramUser() {
        UserEntity user = webUser(99L);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));

        TelegramContactRecoveryResult result = service.acceptVerifiedContact(
                request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920"));

        assertThat(result).isEqualTo(TelegramContactRecoveryResult.IGNORED_ACCOUNT_ALREADY_LINKED);
        assertThat(user.getTelegramUserId()).isEqualTo(99L);
    }

    @Test
    void existingTelegramUserKeepsOrdinaryPasswordChangeFlow() {
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID))
                .thenReturn(Optional.of(webUser(TELEGRAM_ID)));

        TelegramContactRecoveryResult result = service.acceptVerifiedContact(
                request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920"));

        assertThat(result).isEqualTo(TelegramContactRecoveryResult.ALREADY_LINKED);
        verify(userRepository, never()).findByPhone("+79393930920");
    }

    @Test
    void ignoresAccountWithoutWebPassword() {
        UserEntity user = webUser(null);
        user.setPasswordHash(null);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));

        TelegramContactRecoveryResult result = service.acceptVerifiedContact(
                request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920"));

        assertThat(result).isEqualTo(TelegramContactRecoveryResult.IGNORED_ACCOUNT_WITHOUT_PASSWORD);
        assertThat(user.getTelegramUserId()).isNull();
    }

    private UserEntity webUser(Long telegramUserId) {
        UserEntity user = new UserEntity();
        user.setPasswordHash("$2a$10$hash");
        user.setTelegramUserId(telegramUserId);
        return user;
    }

    private TelegramContactWebhookRequest request(long fromId, long contactUserId, String phone) {
        return new TelegramContactWebhookRequest(new TelegramContactWebhookRequest.Message(
                new TelegramContactWebhookRequest.From(fromId),
                new TelegramContactWebhookRequest.Contact(phone, contactUserId)));
    }
}
