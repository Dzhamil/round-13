package com.round13.backend.module.auth.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Утилиты для работы с Telegram WebApp initData.
 *
 * Единственный источник истины для парсинга initData.
 */
public final class TelegramInitDataUtils {

    private TelegramInitDataUtils() {}

    /**
     * Парсит initData (raw query-string) в map параметров.
     * Делает decode так же, как decodeURIComponent в JS.
     */
    public static Map<String, String> parse(String initData) {
        if (initData == null || initData.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        // '+' нельзя превращать в пробел — это важно для подписи
        String safe = initData.replace("+", "%2B");
        String decoded = URLDecoder.decode(safe, StandardCharsets.UTF_8);

        Map<String, String> params = new HashMap<>();
        for (String part : decoded.split("&")) {
            if (part.isBlank()) {
                continue;
            }
            String[] pair = part.split("=", 2);
            if (pair.length != 2) {
                continue;
            }
            params.put(pair[0], pair[1]);
        }

        return params;
    }

    /**
     * Извлекает user (JSON-строку) из initData.
     */
    public static String extractUser(String initData) {
        String user = parse(initData).get("user");
        if (user == null || user.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
        return user;
    }
}
