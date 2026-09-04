package com.round13.backend.module.auth.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

        service.acceptVerifiedContact(request(TELEGRAM_ID, TELEGRAM_ID, "8 (939) 393-09-20"));

        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
    }

    @Test
    void rejectsContactThatDoesNotBelongToSender() {
        assertThatThrownBy(() -> service.acceptVerifiedContact(request(TELEGRAM_ID, 99L, "+79393930920")))
                .isInstanceOfSatisfying(BusinessException.class,
                        error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.TELEGRAM_CONTACT_NOT_OWNED));
        verify(userRepository, never()).findByPhone("+79393930920");
    }

    @Test
    void rejectsAccountLinkedToAnotherTelegramUser() {
        UserEntity user = webUser(99L);
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.acceptVerifiedContact(request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920")))
                .isInstanceOfSatisfying(BusinessException.class,
                        error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED));
        assertThat(user.getTelegramUserId()).isEqualTo(99L);
    }

    @Test
    void existingTelegramUserKeepsOrdinaryPasswordChangeFlow() {
        UserEntity user = webUser(TELEGRAM_ID);
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.of(user));

        service.acceptVerifiedContact(request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920"));

        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
    }

    @Test
    void linksAccountWithoutWebPasswordSoItCanCreateOneInTheApp() {
        UserEntity user = webUser(null);
        user.setPasswordHash(null);
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(user));
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID)).thenReturn(Optional.empty());

        service.acceptVerifiedContact(request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920"));

        assertThat(user.getTelegramUserId()).isEqualTo(TELEGRAM_ID);
    }

    @Test
    void rejectsDifferentPhoneEvenWhenTelegramIdIsAlreadyLinked() {
        UserEntity telegramUser = webUser(TELEGRAM_ID);
        UserEntity phoneUser = webUser(null);
        when(userRepository.findByPhone("+79393930920")).thenReturn(Optional.of(phoneUser));
        when(userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(TELEGRAM_ID))
                .thenReturn(Optional.of(telegramUser));

        assertThatThrownBy(() -> service.acceptVerifiedContact(request(TELEGRAM_ID, TELEGRAM_ID, "+79393930920")))
                .isInstanceOfSatisfying(BusinessException.class,
                        error -> assertThat(error.getErrorCode()).isEqualTo(ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED));
        assertThat(phoneUser.getTelegramUserId()).isNull();
    }

    private UserEntity webUser(Long telegramUserId) {
        UserEntity user = new UserEntity();
        user.setPasswordHash("$2a$10$hash");
        user.setTelegramUserId(telegramUserId);
        return user;
    }

    private TelegramContactWebhookRequest request(long fromId, long contactUserId, String phone) {
        return new TelegramContactWebhookRequest(new TelegramContactWebhookRequest.Message(
                1L,
                new TelegramContactWebhookRequest.Chat(fromId),
                new TelegramContactWebhookRequest.From(fromId),
                null,
                new TelegramContactWebhookRequest.Contact(phone, contactUserId)));
    }
}
