package com.round13.backend.module.sheets.service;

import java.net.URI;
import java.util.OptionalInt;
import java.util.regex.Pattern;

/** Distinguishes tab titles from links into the configured spreadsheet. */
final class TrainerSheetReference {
    private static final Pattern SHEET_PATH = Pattern.compile("/spreadsheets/d/([^/]+)(?:/edit)?/?");
    private static final Pattern GID = Pattern.compile("(?:^|&)gid=([0-9]+)(?:&|$)");

    private TrainerSheetReference() {}

    static OptionalInt sheetId(String reference, String spreadsheetId) {
        if (!reference.regionMatches(true, 0, "https://", 0, 8)
                && !reference.regionMatches(true, 0, "http://", 0, 7)) return OptionalInt.empty();
        URI uri;
        try {
            uri = URI.create(reference);
        } catch (IllegalArgumentException ex) {
            throw invalidLink();
        }
        var path = SHEET_PATH.matcher(uri.getPath());
        if (!"https".equalsIgnoreCase(uri.getScheme()) || !"docs.google.com".equalsIgnoreCase(uri.getHost())
                || uri.getUserInfo() != null || uri.getPort() != -1
                || !path.matches() || !path.group(1).equals(spreadsheetId)) throw invalidLink();
        String parameters = uri.getFragment() == null ? uri.getQuery() : uri.getFragment();
        var gid = GID.matcher(parameters == null ? "" : parameters);
        if (!gid.find()) throw invalidLink();
        try {
            return OptionalInt.of(Integer.parseInt(gid.group(1)));
        } catch (NumberFormatException ex) {
            throw invalidLink();
        }
    }

    private static IllegalArgumentException invalidLink() {
        return new IllegalArgumentException("Личный лист: ожидается ссылка на текущую Google-таблицу с числовым gid");
    }
}
