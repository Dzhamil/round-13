package com.round13.backend.module.auth.service;

public enum TelegramContactRecoveryResult {
    LINKED,
    ALREADY_LINKED,
    IGNORED_INVALID_CONTACT,
    IGNORED_INVALID_PHONE,
    IGNORED_USER_NOT_FOUND,
    IGNORED_ACCOUNT_WITHOUT_PASSWORD,
    IGNORED_ACCOUNT_ALREADY_LINKED
}
