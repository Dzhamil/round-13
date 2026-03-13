package com.round13.backend.module.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Сервис хэширования чувствительных токенов (refresh-token).
 *
 * Храним в БД только хэш, raw-токен клиенту.
 */
@Service
public class TokenHashService {

    private final MessageDigest digest;

    public TokenHashService(
            @Value("${security.refresh-token.hash-algorithm:SHA-256}") String algorithm
    ) {
        try {
            this.digest = MessageDigest.getInstance(algorithm);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Invalid hash algorithm for refresh tokens", e);
        }
    }

    /**
     * Хэширует raw-токен.
     */
    public String hash(String rawToken) {
        byte[] bytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        return toHex(bytes);
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
