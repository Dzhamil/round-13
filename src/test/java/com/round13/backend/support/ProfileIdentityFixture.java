package com.round13.backend.support;

public final class ProfileIdentityFixture {
    public static final String SURNAME = "Иванов";
    public static final String FIRST_NAME = "Иван";
    public static final String PATRONYMIC = "Иванович";
    public static final String FULL_NAME = "Иванов Иван Иванович";

    private ProfileIdentityFixture() {}

    public static String[] nameParts() {
        return new String[]{SURNAME, FIRST_NAME, PATRONYMIC};
    }

    public static String[] paddedNameParts() {
        return new String[]{" " + SURNAME + " ", " " + FIRST_NAME + " ", " " + PATRONYMIC + " "};
    }
}
