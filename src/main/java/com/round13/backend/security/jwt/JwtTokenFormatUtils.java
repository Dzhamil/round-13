package com.round13.backend.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.security.exception.JwtException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Утилиты для формата JWT токена.
 * Делает split, Base64Url и JSON для payload.
 */
public final class JwtTokenFormatUtils {

    /**
     * Регулярка разделителя частей JWT.
     */
    public static final String JWT_PARTS_DELIMITER_REGEX = "\\.";

    /**
     * Ожидаемое количество частей JWT.
     */
    public static final int JWT_PARTS_COUNT = 3;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private JwtTokenFormatUtils() {
        throw new IllegalStateException("Утилитный класс");
    }

    /**
     * Разбивает JWT на header, payload и signature.
     */
    public static String[] split(String token) {
        if (token == null || token.isBlank()) {
            throw new JwtException("JWT не задан");
        }
        String[] parts = token.split(JWT_PARTS_DELIMITER_REGEX);
        if (parts.length != JWT_PARTS_COUNT) {
            throw new JwtException("Неверный формат JWT");
        }
        return parts;
    }

    /**
     * Кодирует байты в Base64Url без паддинга.
     */
    public static String base64UrlEncode(byte[] value) {
        if (value == null) {
            throw new JwtException("Нет данных для кодирования");
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    /**
     * Декодирует Base64Url строку в байты.
     */
    public static byte[] base64UrlDecode(String value) {
        if (value == null || value.isBlank()) {
            throw new JwtException("Нет данных для декодирования");
        }
        try {
            return Base64.getUrlDecoder().decode(value);
        } catch (IllegalArgumentException e) {
            throw new JwtException("Ошибка Base64Url декодирования", e);
        }
    }

    /**
     * Декодирует Base64Url строку в UTF-8 строку.
     */
    public static String base64UrlDecodeToString(String value) {
        return new String(base64UrlDecode(value), StandardCharsets.UTF_8);
    }

    /**
     * Кодирует UTF-8 строку в Base64Url без паддинга.
     */
    public static String base64UrlEncodeString(String value) {
        if (value == null) {
            throw new JwtException("Нет строки для кодирования");
        }
        return base64UrlEncode(value.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Читает JSON строку в Map claims.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> readJsonToMap(String json) {
        if (json == null || json.isBlank()) {
            throw new JwtException("Пустой JSON");
        }
        try {
            return OBJECT_MAPPER.readValue(json, Map.class);
        } catch (Exception e) {
            throw new JwtException("Ошибка парсинга JSON", e);
        }
    }

    /**
     * Пишет Map claims в JSON строку.
     */
    public static String writeMapToJson(Map<String, Object> map) {
        if (map == null) {
            throw new JwtException("Claims не заданы");
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(map);
        } catch (Exception e) {
            throw new JwtException("Ошибка сериализации JSON", e);
        }
    }
}
