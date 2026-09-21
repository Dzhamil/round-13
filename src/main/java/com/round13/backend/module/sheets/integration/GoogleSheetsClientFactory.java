package com.round13.backend.module.sheets.integration;

import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.auth.http.HttpCredentialsAdapter;
import com.round13.backend.domain.GoogleSheetSpaceEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GoogleSheetsClientFactory {
    private final ServiceAccountCredentialsProvider credentialsProvider;
    private final NetHttpTransport transport = new NetHttpTransport();

    public GoogleSheetsClient open(GoogleSheetSpaceEntity space) {
        var auth = new HttpCredentialsAdapter(credentialsProvider.credentials(space.getCredentialsEnvVar()));
        var sheets = new Sheets.Builder(transport, GsonFactory.getDefaultInstance(), request -> {
            request.setConnectTimeout(15_000);
            request.setReadTimeout(60_000);
            // Preserve the previous transport's no-retry behavior, especially for append operations.
            request.setNumberOfRetries(0);
            try {
                auth.initialize(request);
            } catch (java.io.IOException ex) {
                throw SheetsErrors.unavailable("Не удалось авторизовать service account", ex);
            }
        }).setApplicationName("round13-backend").build();
        return new GoogleSheetsClient(sheets, space.getSpreadsheetId());
    }
}
