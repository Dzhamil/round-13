package com.round13.backend.module.sheets.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.round13.backend.domain.GoogleSheetSpaceEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.*;

@Component
@RequiredArgsConstructor
public class GoogleSheetsHttpGateway implements GoogleSheetsGateway {
    private static final String SCOPE = "https://www.googleapis.com/auth/spreadsheets";
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(15)).build();

    @Override
    public void testReadWrite(GoogleSheetSpaceEntity space) {
        String token = token(space);
        send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId()
                        + "?fields=spreadsheetId,properties.title"))
                .header("Authorization", "Bearer " + token).GET().build());
        // A harmless write request validates editor permission without changing cell values.
        send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId() + ":batchUpdate"))
                .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"requests\":[]}")) .build());
    }

    @Override
    public List<List<String>> readRows(GoogleSheetSpaceEntity space, String range) {
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/"
                        + space.getSpreadsheetId() + "/values/" + encode(range)))
                .header("Authorization", "Bearer " + token(space)).GET().build());
        try {
            List<List<String>> rows = new ArrayList<>();
            for (JsonNode row : objectMapper.readTree(response.body()).path("values")) {
                List<String> values = new ArrayList<>();
                row.forEach(cell -> values.add(cell.asText()));
                rows.add(List.copyOf(values));
            }
            return List.copyOf(rows);
        } catch (Exception ex) {
            throw unavailable("Не удалось разобрать данные Google Sheets", ex);
        }
    }

    @Override
    public void appendRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows) {
        if (rows.isEmpty()) return;
        ensureSheet(space, sheetName);
        Map<String, Object> body = Map.of("majorDimension", "ROWS", "values", rows);
        try {
            String range = encode("'" + sheetName.replace("'", "''") + "'!A:Z");
            String json = objectMapper.writeValueAsString(body);
            send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId()
                            + "/values/" + range + ":append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS"))
                    .header("Authorization", "Bearer " + token(space)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json)).build());
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Не удалось добавить строки Google Sheets", ex); }
    }

    @Override
    public void replaceRows(GoogleSheetSpaceEntity space, String sheetName, List<List<Object>> rows) {
        ensureSheet(space, sheetName);
        String range = encode("'" + sheetName.replace("'", "''") + "'!A1");
        Map<String, Object> body = Map.of("range", sheetName + "!A1", "majorDimension", "ROWS", "values", rows);
        try {
            String json = objectMapper.writeValueAsString(body);
            send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId()
                            + "/values/" + encode("'" + sheetName.replace("'", "''") + "'!A:Z") + ":clear"))
                    .header("Authorization", "Bearer " + token(space)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{}")) .build());
            send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId()
                            + "/values/" + range + "?valueInputOption=RAW"))
                    .header("Authorization", "Bearer " + token(space)).header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(json)).build());
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Не удалось подготовить данные Google Sheets", ex); }
    }

    @Override
    public void replaceParticipantRows(GoogleSheetSpaceEntity space, List<List<Object>> participants,
                                       List<List<Object>> trainers) {
        ensureSheet(space, "Участники");
        ensureSheet(space, "Справочник тренеров");
        String endpoint = "https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId();
        String accessToken = token(space);
        try {
            JsonNode metadata = objectMapper.readTree(send(HttpRequest.newBuilder(URI.create(endpoint + "?fields=sheets.properties"))
                    .header("Authorization", "Bearer " + accessToken).GET().build()).body());
            int participantId = -1, lookupId = -1;
            for (JsonNode sheet : metadata.path("sheets")) {
                String title = sheet.path("properties").path("title").asText();
                if ("Участники".equals(title)) participantId = sheet.path("properties").path("sheetId").asInt();
                if ("Справочник тренеров".equals(title)) lookupId = sheet.path("properties").path("sheetId").asInt();
            }
            if (participantId < 0 || lookupId < 0) throw new IllegalStateException("Missing participant or trainer lookup sheet");
            List<Object> requests = new ArrayList<>();
            for (int id : new int[]{participantId, lookupId}) {
                requests.add(Map.of("repeatCell", Map.of("range", Map.of("sheetId", id),
                        "cell", Map.of(), "fields", "dataValidation")));
            }
            requests.add(Map.of("setDataValidation", Map.of("range", Map.of("sheetId", participantId,
                    "startRowIndex", 1, "startColumnIndex", 5, "endColumnIndex", 6),
                    "rule", Map.of("condition", Map.of("type", "ONE_OF_RANGE", "values", List.of(
                            Map.of("userEnteredValue", "='Справочник тренеров'!$A$2:$A" + Math.max(2, trainers.size())))),
                            "strict", true, "showCustomUi", true))));
            send(HttpRequest.newBuilder(URI.create(endpoint + ":batchUpdate"))
                    .header("Authorization", "Bearer " + accessToken).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(Map.of("requests", requests)))).build());
            for (String name : List.of("Участники", "Справочник тренеров")) {
                send(HttpRequest.newBuilder(URI.create(endpoint + "/values/" + encode("'" + name + "'!A:Z") + ":clear"))
                        .header("Authorization", "Bearer " + accessToken).header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString("{}")) .build());
            }
            List<List<Object>> rawParticipants = new ArrayList<>();
            for (List<Object> row : participants) {
                List<Object> copy = new ArrayList<>(row);
                if (rawParticipants.size() > 0) copy.set(6, "");
                rawParticipants.add(copy);
            }
            List<Map<String, Object>> data = List.of(
                    Map.of("range", "'Справочник тренеров'!A1", "values", trainers),
                    Map.of("range", "'Участники'!A1", "values", rawParticipants));
            send(HttpRequest.newBuilder(URI.create(endpoint + "/values:batchUpdate"))
                    .header("Authorization", "Bearer " + accessToken).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(Map.of(
                            "valueInputOption", "RAW", "data", data)))).build());
            if (participants.size() > 1) {
                List<List<Object>> formulas = participants.subList(1, participants.size()).stream()
                        .map(row -> List.of(row.get(6))).toList();
                send(HttpRequest.newBuilder(URI.create(endpoint + "/values/" + encode("'Участники'!G2")
                        + "?valueInputOption=USER_ENTERED"))
                        .header("Authorization", "Bearer " + accessToken).header("Content-Type", "application/json")
                        .PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(Map.of(
                                "majorDimension", "ROWS", "values", formulas)))).build());
            }
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Не удалось обновить вкладку участников", ex); }
    }

    @Override
    public void ensureSheet(GoogleSheetSpaceEntity space, String name) {
        String token=token(space);
        HttpResponse<String> metadata=send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/"+space.getSpreadsheetId()+"?fields=sheets.properties.title")).header("Authorization","Bearer "+token).GET().build());
        try {
            for(JsonNode sheet:objectMapper.readTree(metadata.body()).path("sheets")) if(name.equals(sheet.path("properties").path("title").asText())) return;
            String body=objectMapper.writeValueAsString(Map.of("requests",List.of(Map.of("addSheet",Map.of("properties",Map.of("title",name))))));
            send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/"+space.getSpreadsheetId()+":batchUpdate")).header("Authorization","Bearer "+token).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build());
        } catch(Exception ex){throw unavailable("Не удалось подготовить лист "+name,ex);}
    }

    @Override
    public void updateValues(GoogleSheetSpaceEntity space, List<ValueUpdate> updates) {
        try {
            String body = objectMapper.writeValueAsString(Map.of("valueInputOption", "RAW", "data", updates));
            send(HttpRequest.newBuilder(URI.create("https://sheets.googleapis.com/v4/spreadsheets/"
                            + space.getSpreadsheetId() + "/values:batchUpdate"))
                    .timeout(java.time.Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + token(space)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body)).build());
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Не удалось записать состав тренеров", ex); }
    }

    @Override
    public void formatTable(GoogleSheetSpaceEntity space, String name, int rows, int columns, int filterColumns) {
        String accessToken = token(space);
        String endpoint = "https://sheets.googleapis.com/v4/spreadsheets/" + space.getSpreadsheetId();
        var metadata = send(HttpRequest.newBuilder(URI.create(endpoint + "?fields=sheets.properties"))
                .header("Authorization", "Bearer " + accessToken).GET().build());
        try {
            JsonNode properties = null;
            for (JsonNode sheet : objectMapper.readTree(metadata.body()).path("sheets")) {
                if (name.equals(sheet.path("properties").path("title").asText())) properties = sheet.path("properties");
            }
            if (properties == null) throw new IllegalStateException("Missing export tab");
            int id = properties.path("sheetId").asInt();
            Map<String, Object> grid = Map.of("rowCount", Math.max(Math.max(2, rows), properties.path("gridProperties").path("rowCount").asInt()),
                    "columnCount", Math.max(columns, properties.path("gridProperties").path("columnCount").asInt()), "frozenRowCount", 1);
            var requests = List.of(
                    Map.of("updateSheetProperties", Map.of("properties", Map.of("sheetId", id, "gridProperties", grid),
                            "fields", "gridProperties.rowCount,gridProperties.columnCount,gridProperties.frozenRowCount")),
                    Map.of("setBasicFilter", Map.of("filter", Map.of("range", Map.of("sheetId", id,
                            "startRowIndex", 0, "endRowIndex", Math.max(2, rows), "startColumnIndex", 0, "endColumnIndex", filterColumns)))),
                    Map.of("updateDimensionProperties", Map.of("range", Map.of("sheetId", id, "dimension", "COLUMNS",
                            "startIndex", 0, "endIndex", filterColumns), "properties", Map.of("pixelSize", 180), "fields", "pixelSize")),
                    Map.of("repeatCell", Map.of("range", Map.of("sheetId", id, "startRowIndex", 0, "endRowIndex", 1),
                            "cell", Map.of("userEnteredFormat", Map.of("textFormat", Map.of("bold", true), "wrapStrategy", "WRAP")),
                            "fields", "userEnteredFormat")));
            send(HttpRequest.newBuilder(URI.create(endpoint + ":batchUpdate"))
                    .header("Authorization", "Bearer " + accessToken).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(Map.of("requests", requests)))).build());
        } catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Не удалось оформить вкладку пользователей", ex); }
    }

    private String token(GoogleSheetSpaceEntity space) {
        String envName = space.getCredentialsEnvVar();
        String credentialJson = envName == null ? null : System.getenv(envName);
        if (credentialJson == null || credentialJson.isBlank()) {
            throw unavailable("Нет credentials в переменной окружения " + (envName == null ? "(не настроена)" : envName), null);
        }
        try {
            JsonNode credential = objectMapper.readTree(credentialJson);
            String email = credential.path("client_email").asText();
            String privateKey = credential.path("private_key").asText();
            String tokenUri = credential.path("token_uri").asText("https://oauth2.googleapis.com/token");
            long now = Instant.now().getEpochSecond();
            String header = base64(objectMapper.writeValueAsBytes(Map.of("alg", "RS256", "typ", "JWT")));
            String claims = base64(objectMapper.writeValueAsBytes(Map.of("iss", email, "scope", SCOPE,
                    "aud", tokenUri, "iat", now, "exp", now + 3600)));
            String unsigned = header + "." + claims;
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey(privateKey));
            signature.update(unsigned.getBytes(StandardCharsets.UTF_8));
            String assertion = unsigned + "." + base64(signature.sign());
            String form = "grant_type=" + encode("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + encode(assertion);
            HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(tokenUri))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form)).build());
            String accessToken = objectMapper.readTree(response.body()).path("access_token").asText();
            if (accessToken.isBlank()) throw new IllegalStateException("Google OAuth did not return access_token");
            return accessToken;
        } catch (Exception ex) { throw unavailable("Не удалось авторизовать service account", ex); }
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(HttpRequest.newBuilder(request, (name, value) -> true)
                    .timeout(java.time.Duration.ofSeconds(60)).build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw unavailable("Google Sheets API ответил HTTP " + response.statusCode() + ": " + response.body(), null);
            }
            return response;
        } catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw unavailable("Запрос Google Sheets прерван", ex); }
        catch (ResponseStatusException ex) { throw ex; }
        catch (Exception ex) { throw unavailable("Google Sheets API недоступен", ex); }
    }
    private PrivateKey privateKey(String pem) throws Exception {
        String value = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(value)));
    }
    private String base64(byte[] value) { return Base64.getUrlEncoder().withoutPadding().encodeToString(value); }
    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20"); }
    private ResponseStatusException unavailable(String message, Throwable cause) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, message, cause);
    }
}
