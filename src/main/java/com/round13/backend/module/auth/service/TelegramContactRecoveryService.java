package com.round13.backend.module.auth.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.auth.dto.TelegramContactWebhookRequest;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TelegramContactRecoveryService {

    private final UserRepository userRepository;
    private final RussianPhoneNormalizer phoneNormalizer;

    @Transactional
    public UserEntity acceptVerifiedContact(TelegramContactWebhookRequest request) {
        TelegramContactWebhookRequest.Message message = request == null ? null : request.message();
        if (message == null || message.from() == null || message.contact() == null
                || message.from().id() == null || message.contact().userId() == null
                || !message.from().id().equals(message.contact().userId())) {
            throw new BusinessException(ErrorCode.TELEGRAM_CONTACT_NOT_OWNED);
        }

        String phone = phoneNormalizer.normalize(message.contact().phoneNumber())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REQUEST));
        UserEntity user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        long telegramUserId = message.from().id();
        var telegramAccount = userRepository.findTopByTelegramUserIdOrderByCreatedAtDesc(telegramUserId);
        if (telegramAccount.isPresent() && !sameUser(telegramAccount.get(), user)) {
            throw new BusinessException(ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED);
        }
        if (user.getTelegramUserId() != null && user.getTelegramUserId() != telegramUserId) {
            throw new BusinessException(ErrorCode.TELEGRAM_ACCOUNT_ALREADY_LINKED);
        }
        user.setTelegramUserId(telegramUserId);
        return user;
    }

    private boolean sameUser(UserEntity left, UserEntity right) {
        if (left == right) {
            return true;
        }
        return left.getId() != null && left.getId().equals(right.getId());
    }
}
