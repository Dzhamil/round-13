package com.round13.backend.module.auth.service;

import com.round13.backend.module.auth.dto.TelegramInitDataRequest;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramInitDataValidationService {

    private static final HexFormat HEX = HexFormat.of();
    private static final byte[] WEB_APP_DATA =
            "WebAppData".getBytes(StandardCharsets.UTF_8);

    private static final long AUTH_DATE_TTL_SECONDS = 30L * 60L;
    private static final long AUTH_DATE_FUTURE_SKEW_SECONDS = 60L;

    @Value("${telegram.bot-token}")
    private String botToken;

    /**
     * Вариант A: request содержит только initData (raw query-string целиком).
     */
    public void validate(TelegramInitDataRequest request) {
        if (request == null || request.initData() == null || request.initData().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        validateInitData(request.initData());
    }

    /**
     * Валидация подписи Telegram WebApp initData.
     */
    public void validateInitData(String initDataRaw) {
        String traceId = shortTraceId();
        log.info("[TG-AUTH:{}] validation started", traceId);

        Map<String, String> params = TelegramInitDataUtils.parse(initDataRaw);

        String hash = params.get("hash");
        String authDateStr = params.get("auth_date");

        if (!isPresent(hash) || !isPresent(authDateStr)) {
            log.warn("[TG-AUTH:{}] validation failed: MISSING_REQUIRED_FIELDS", traceId);
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (!isHex64(hash)) {
            log.warn("[TG-AUTH:{}] validation failed: INVALID_HASH_FORMAT", traceId);
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }

        long authDate = parseLong(authDateStr, traceId);
        validateAuthDate(authDate, traceId);

        String dataCheckString = buildDataCheckString(params);

        // secret_key = HMAC_SHA256("WebAppData", bot_token)  (key="WebAppData", data=bot_token)
        byte[] secretKey = TelegramCrypto.calculateHmacSha256(
                WEB_APP_DATA,
                botToken.getBytes(StandardCharsets.UTF_8)
        );

        byte[] expectedBytes = TelegramCrypto.calculateHmacSha256(
                secretKey,
                dataCheckString.getBytes(StandardCharsets.UTF_8)
        );

        String expectedHash = HEX.formatHex(expectedBytes);

        if (!TelegramCrypto.constantTimeEquals(expectedHash, hash)) {
            log.warn(
                    "[TG-AUTH:{}] validation failed: HASH_MISMATCH expectedPrefix={}, actualPrefix={}, authDate={}, dcs.len={}",
                    traceId,
                    safePrefix(expectedHash),
                    safePrefix(hash),
                    authDate,
                    dataCheckString.length()
            );
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }

        log.info("[TG-AUTH:{}] validation success", traceId);
    }

    private String buildDataCheckString(Map<String, String> params) {
        List<String> pairs = new ArrayList<>();
        for (Map.Entry<String, String> e : params.entrySet()) {
            if ("hash".equals(e.getKey())) {
                continue;
            }
            pairs.add(e.getKey() + "=" + e.getValue());
        }
        pairs.sort(Comparator.naturalOrder());
        return String.join("\n", pairs);
    }

    private void validateAuthDate(long authDateSeconds, String traceId) {
        long nowSeconds = Instant.now().getEpochSecond();

        if (authDateSeconds > nowSeconds + AUTH_DATE_FUTURE_SKEW_SECONDS) {
            log.warn("[TG-AUTH:{}] validation failed: AUTH_DATE_IN_FUTURE authDate={}, now={}", traceId, authDateSeconds, nowSeconds);
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }

        long ageSeconds = nowSeconds - authDateSeconds;
        if (ageSeconds > AUTH_DATE_TTL_SECONDS) {
            log.warn("[TG-AUTH:{}] validation failed: AUTH_DATE_EXPIRED ageSeconds={}, ttlSeconds={}", traceId, ageSeconds, AUTH_DATE_TTL_SECONDS);
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
    }

    private long parseLong(String value, String traceId) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("[TG-AUTH:{}] validation failed: INVALID_AUTH_DATE_FORMAT value={}", traceId, value);
            throw new BusinessException(ErrorCode.INVALID_TELEGRAM_INIT_DATA);
        }
    }

    private String shortTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private boolean isPresent(String s) {
        return s != null && !s.isBlank();
    }

    private String safePrefix(String value) {
        if (!isPresent(value)) {
            return null;
        }
        return value.length() <= 8 ? value : value.substring(0, 8);
    }

    private boolean isHex64(String value) {
        if (value == null || value.length() != 64) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            boolean ok = (c >= '0' && c <= '9')
                    || (c >= 'a' && c <= 'f')
                    || (c >= 'A' && c <= 'F');
            if (!ok) {
                return false;
            }
        }
        return true;
    }
}
