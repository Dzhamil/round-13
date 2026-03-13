package com.round13.backend.module.shop.util;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;

import java.util.Base64;

/**
 * Утилиты для картинок магазина.
 */
public final class ShopImageUtils {

    private static final String DATA_PREFIX = "data:";
    private static final String BASE64_MARKER = ";base64,";
    private static final String IMAGE_CONTENT_TYPE_PREFIX = "image/";
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "image/jpeg";

    private ShopImageUtils() {
    }

    public record DecodedImage(String contentType, byte[] bytes) {
    }

    public static DecodedImage decodeDataUrlOrNull(String rawValue, int maxBytes) {
        String value = trimToNull(rawValue);
        if (value == null) return null;

        int markerIndex = value.indexOf(BASE64_MARKER);
        if (!value.startsWith(DATA_PREFIX) || markerIndex < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        String contentType = value.substring(DATA_PREFIX.length(), markerIndex).trim();
        if (!contentType.startsWith(IMAGE_CONTENT_TYPE_PREFIX)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        String base64 = value.substring(markerIndex + BASE64_MARKER.length()).trim();
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (bytes.length == 0 || bytes.length > maxBytes) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return new DecodedImage(contentType, bytes);
    }

    public static String toDataUrl(String contentType, byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;
        String ct = (contentType == null || contentType.isBlank()) ? DEFAULT_IMAGE_CONTENT_TYPE : contentType.trim();
        return DATA_PREFIX + ct + BASE64_MARKER + Base64.getEncoder().encodeToString(bytes);
    }

    public static boolean isDataUrl(String value) {
        String normalized = trimToNull(value);
        return normalized != null && normalized.startsWith(DATA_PREFIX) && normalized.contains(BASE64_MARKER);
    }

    public static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
