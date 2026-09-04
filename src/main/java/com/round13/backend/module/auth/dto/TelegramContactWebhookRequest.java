package com.round13.backend.module.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Минимальная модель Telegram Update для contact service message. */
public record TelegramContactWebhookRequest(Message message) {

    public record Message(
            @JsonProperty("message_id")
            Long messageId,
            Chat chat,
            From from,
            String text,
            Contact contact
    ) {}

    public record Chat(Long id) {}

    public record From(Long id) {}

    public record Contact(
            @JsonProperty("phone_number") String phoneNumber,
            @JsonProperty("user_id") Long userId
    ) {}
}
