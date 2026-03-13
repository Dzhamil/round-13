package com.round13.backend.module.auth.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Крипто-утилиты для Telegram WebApp initData.
 * Важно:
 * - calculateHmacSha256(key, data) -> HMAC_SHA256(key, data)
 * - constantTimeEquals защищает от timing attacks
 */
public final class TelegramCrypto {

    private static final String HMAC_SHA_256 = "HmacSHA256";

    private TelegramCrypto() {
    }

    /**
     * Возвращает HMAC-SHA256(data) с ключом key.
     *
     * @param key  ключ HMAC
     * @param data данные
     * @return bytes подписи
     */
    public static byte[] calculateHmacSha256(byte[] key, byte[] data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA_256);
            mac.init(new SecretKeySpec(key, HMAC_SHA_256));
            return mac.doFinal(data);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }

    /**
     * Безопасное сравнение строк в constant-time.
     * Ожидается сравнение hex-строк одинаковой длины.
     */
    public static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] x = a.toLowerCase().getBytes(StandardCharsets.UTF_8);
        byte[] y = b.toLowerCase().getBytes(StandardCharsets.UTF_8);

        if (x.length != y.length) {
            return false;
        }

        int diff = 0;
        for (int i = 0; i < x.length; i++) {
            diff |= x[i] ^ y[i];
        }
        return diff == 0;
    }
}
