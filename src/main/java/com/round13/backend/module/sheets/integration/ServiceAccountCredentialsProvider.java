package com.round13.backend.module.sheets.integration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.api.services.sheets.v4.SheetsScopes;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Function;

@Component
public class ServiceAccountCredentialsProvider {
    private final Function<String, String> environment;

    public ServiceAccountCredentialsProvider() {
        this(System::getenv);
    }

    ServiceAccountCredentialsProvider(Function<String, String> environment) {
        this.environment = environment;
    }

    public GoogleCredentials credentials(String environmentVariable) {
        String json = environmentVariable == null ? null : environment.apply(environmentVariable);
        if (json == null || json.isBlank()) {
            throw SheetsErrors.unavailable("Нет credentials в переменной окружения "
                    + (environmentVariable == null ? "(не настроена)" : environmentVariable), null);
        }
        try (var stream = new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8))) {
            return ServiceAccountCredentials.fromStream(stream).createScoped(List.of(SheetsScopes.SPREADSHEETS));
        } catch (Exception ex) {
            throw SheetsErrors.unavailable("Не удалось авторизовать service account", ex);
        }
    }
}
