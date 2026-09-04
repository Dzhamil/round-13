package com.round13.backend.module.auth.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramContactRecoveryService {

    private final UserRepository userRepository;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Transactional
    public TelegramContactRecoveryResult acceptVerifiedContact(TelegramContactWebhookRequest request) {
        TelegramContactWebhookRequest.Message message = request == null ? null : request.message();
        if (!isOwnContact(message)) {
            log.info("Ignored Telegram contact recovery update: contact does not belong to sender");
            return TelegramContactRecoveryResult.IGNORED_INVALID_CONTACT;
        }

        long telegramUserId = message.from().id();
        if (userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(telegramUserId).isPresent()) {
            return TelegramContactRecoveryResult.ALREADY_LINKED;
        }

        Optional<String> normalizedPhone = phoneNormalizer.normalize(message.contact().phoneNumber());
        if (normalizedPhone.isEmpty()) {
            log.info("Ignored Telegram contact recovery update: invalid phone");
            return TelegramContactRecoveryResult.IGNORED_INVALID_PHONE;
        }

        Optional<UserEntity> userCandidate = userRepository.findByPhone(normalizedPhone.get());
        if (userCandidate.isEmpty()) {
            log.info("Ignored Telegram contact recovery update: user not found by phone");
            return TelegramContactRecoveryResult.IGNORED_USER_NOT_FOUND;
        }

        UserEntity user = userCandidate.get();
        if (user.getPasswordHash() == null) {
            log.info("Ignored Telegram contact recovery update: account has no web password");
            return TelegramContactRecoveryResult.IGNORED_ACCOUNT_WITHOUT_PASSWORD;
        }
        if (user.getTelegramUserId() != null && user.getTelegramUserId() != telegramUserId) {
            log.info("Ignored Telegram contact recovery update: account is already linked to another Telegram user");
            return TelegramContactRecoveryResult.IGNORED_ACCOUNT_ALREADY_LINKED;
        }
        user.setTelegramUserId(telegramUserId);
        return TelegramContactRecoveryResult.LINKED;
    }

    private boolean isOwnContact(TelegramContactWebhookRequest.Message message) {
        return message != null
                && message.from() != null
                && message.contact() != null
                && message.from().id() != null
                && message.from().id().equals(message.contact().userId());
    }
}
