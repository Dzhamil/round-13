package com.round13.backend.security;

import static com.round13.backend.security.jwt.JwtClaimsValidator.CLAIM_EXPIRATION;
import static com.round13.backend.security.jwt.JwtClaimsValidator.CLAIM_ISSUER;
import static com.round13.backend.security.jwt.JwtClaimsValidator.CLAIM_SUBJECT;
import static com.round13.backend.security.jwt.JwtClaimsValidator.CLAIM_TOKEN_TYPE;
import static com.round13.backend.security.jwt.JwtClaimsValidator.TOKEN_TYPE_ACCESS;
import static com.round13.backend.security.jwt.JwtClaimsValidator.TOKEN_TYPE_REFRESH;

import com.round13.backend.security.exception.JwtException;
import com.round13.backend.security.jwt.JwtClaimsValidator;
import com.round13.backend.security.jwt.JwtTokenFormatUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Сервис генерации и проверки JWT токенов.
 * Использует симметричную подпись HS256.
 */
@Service
public class JwtService {

    private static final String CLAIM_ISSUED_AT = "iat";
    private static final String CLAIM_ROLES = "roles";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String TOKEN_PART_SEPARATOR = ".";
    private static final String JWT_HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final int MIN_SECRET_LENGTH = 32;
    private static final Clock CLOCK = Clock.systemUTC();

    private final SecretKeySpec key;
    private final String issuer;
    private final Duration accessTtl;
    private final Duration refreshTtl;
    private final JwtClaimsValidator jwtClaimsValidator;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.issuer:round13}") String issuer,
            @Value("${app.jwt.access-ttl:PT30M}") Duration accessTtl,
            @Value("${app.jwt.refresh-ttl:P30D}") Duration refreshTtl,
            JwtClaimsValidator jwtClaimsValidator
    ) {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new JwtException("JWT секрет должен быть не короче 32 символов");
        }
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
        this.issuer = issuer;
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
        this.jwtClaimsValidator = jwtClaimsValidator;
    }

    /**
     * Генерирует access токен пользователя.
     */
    public String generateAccessToken(String userId, List<String> roles) {
        return generateToken(userId, roles, TOKEN_TYPE_ACCESS, accessTtl);
    }

    /**
     * Генерирует refresh токен пользователя.
     */
    public String generateRefreshToken(String userId, List<String> roles) {
        return generateToken(userId, roles, TOKEN_TYPE_REFRESH, refreshTtl);
    }

    /**
     * Проверяет подпись и срок действия токена.
     * Возвращает набор claims.
     */
    public Map<String, Object> validateAndParse(String token) {
        String[] parts = JwtTokenFormatUtils.split(token);
        String signedPart = parts[0] + TOKEN_PART_SEPARATOR + parts[1];

        String expectedSignature = sign(signedPart);
        if (!MessageDigest.isEqual(
                JwtTokenFormatUtils.base64UrlDecode(parts[2]),
                JwtTokenFormatUtils.base64UrlDecode(expectedSignature)
        )) {
            throw new JwtException("Неверная подпись JWT");
        }

        Map<String, Object> claims = JwtTokenFormatUtils.readJsonToMap(
                JwtTokenFormatUtils.base64UrlDecodeToString(parts[1])
        );

        jwtClaimsValidator.validate(claims);

        return claims;
    }

    /**
     * Возвращает идентификатор пользователя из токена.
     */
    public UUID getUserId(Map<String, Object> claims) {
        return jwtClaimsValidator.extractUserId(claims);
    }

    /**
     * Возвращает роли пользователя из токена.
     */
    public List<String> getRoles(Map<String, Object> claims) {
        Object value = claims.get(CLAIM_ROLES);
        if (!(value instanceof List<?> roles)) {
            return List.of();
        }

        return roles.stream()
                .map(String::valueOf)
                .toList();
    }

    /**
     * Проверяет что токен является access.
     */
    public boolean isAccessToken(Map<String, Object> claims) {
        return TOKEN_TYPE_ACCESS.equals(claims.get(CLAIM_TOKEN_TYPE));
    }

    /**
     * Проверяет что токен является refresh.
     */
    public boolean isRefreshToken(Map<String, Object> claims) {
        return TOKEN_TYPE_REFRESH.equals(claims.get(CLAIM_TOKEN_TYPE));
    }

    private String generateToken(String userId, List<String> roles, String type, Duration ttl) {
        Instant now = CLOCK.instant();

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put(CLAIM_ISSUER, issuer);
        claims.put(CLAIM_SUBJECT, userId);
        claims.put(CLAIM_ISSUED_AT, now.getEpochSecond());
        claims.put(CLAIM_EXPIRATION, now.plus(ttl).getEpochSecond());
        claims.put(CLAIM_TOKEN_TYPE, type);
        claims.put(CLAIM_ROLES, roles == null ? List.of() : roles);

        String header = JwtTokenFormatUtils.base64UrlEncodeString(JWT_HEADER_JSON);
        String payload = JwtTokenFormatUtils.base64UrlEncodeString(JwtTokenFormatUtils.writeMapToJson(claims));
        String signedPart = header + TOKEN_PART_SEPARATOR + payload;
        String signature = sign(signedPart);

        return signedPart + TOKEN_PART_SEPARATOR + signature;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(key);
            return JwtTokenFormatUtils.base64UrlEncode(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new JwtException("Ошибка подписи JWT", e);
        }
    }
}
