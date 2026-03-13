package com.round13.backend.security.jwt;

import com.round13.backend.security.exception.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Сервис валидации JWT claims и извлечения обязательных значений.
 */
@Service
public class JwtClaimsValidator {

    public static final String CLAIM_ISSUER = "iss";
    public static final String CLAIM_SUBJECT = "sub";
    public static final String CLAIM_EXPIRATION = "exp";
    public static final String CLAIM_TOKEN_TYPE = "typ";

    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    private static final Clock CLOCK = Clock.systemUTC();

    private final String issuer;

    public JwtClaimsValidator(@Value("${app.jwt.issuer:round13}") String issuer) {
        this.issuer = issuer;
    }

    /**
     * Валидирует обязательные claims и срок действия токена.
     *
     * @param claims claims JWT
     * @throws JwtException если claims некорректны или токен истёк
     */
    public void validate(Map<String, Object> claims) {
        validateIssuer(claims);
        validateExpiration(claims);
        validateTokenType(claims);
    }

    /**
     * Извлекает идентификатор пользователя из claims.
     *
     * @param claims claims JWT
     * @return UUID пользователя
     * @throws JwtException если sub отсутствует или некорректен
     */
    public UUID extractUserId(Map<String, Object> claims) {
        Object sub = claims.get(CLAIM_SUBJECT);
        if (sub == null) {
            throw new JwtException("Отсутствует sub в JWT");
        }

        try {
            return UUID.fromString(String.valueOf(sub));
        } catch (RuntimeException ex) {
            throw new JwtException("Некорректный sub в JWT", ex);
        }
    }

    private void validateIssuer(Map<String, Object> claims) {
        Object iss = claims.get(CLAIM_ISSUER);
        if (iss == null || !issuer.equals(String.valueOf(iss))) {
            throw new JwtException("Неверный издатель токена");
        }
    }

    private void validateExpiration(Map<String, Object> claims) {
        Object exp = claims.get(CLAIM_EXPIRATION);
        if (!(exp instanceof Number)) {
            throw new JwtException("В токене отсутствует срок действия");
        }

        long expSeconds = ((Number) exp).longValue();
        if (CLOCK.instant().isAfter(Instant.ofEpochSecond(expSeconds))) {
            throw new JwtException("Срок действия токена истёк");
        }
    }

    private void validateTokenType(Map<String, Object> claims) {
        Object typ = claims.get(CLAIM_TOKEN_TYPE);
        if (typ == null) {
            throw new JwtException("Отсутствует typ в JWT");
        }

        String type = String.valueOf(typ);
        if (!TOKEN_TYPE_ACCESS.equals(type) && !TOKEN_TYPE_REFRESH.equals(type)) {
            throw new JwtException("Некорректный typ в JWT");
        }
    }
}
