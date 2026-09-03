package com.round13.backend.module.auth.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class TelegramWebhookAuthenticator {

    private final byte[] expectedSecret;

    public TelegramWebhookAuthenticator(@Value("${telegram.webhook-secret:}") String expectedSecret) {
        this.expectedSecret = expectedSecret.getBytes(StandardCharsets.UTF_8);
    }

    public void verify(String suppliedSecret) {
        byte[] supplied = suppliedSecret == null
                ? new byte[0]
                : suppliedSecret.getBytes(StandardCharsets.UTF_8);
        if (expectedSecret.length == 0 || !MessageDigest.isEqual(expectedSecret, supplied)) {
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
    }
}
