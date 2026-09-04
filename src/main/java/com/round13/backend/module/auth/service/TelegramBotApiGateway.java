package com.round13.backend.module.auth.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class TelegramBotApiGateway implements TelegramBotGateway {

    private static final Logger log = LoggerFactory.getLogger(TelegramBotApiGateway.class);
    private static final String RECOVERY_ACTION = "Восстановить пароль";

    private final RestClient restClient;
    private final String botToken;
    private final String passwordResetUrl;

    public TelegramBotApiGateway(
            RestClient.Builder restClientBuilder,
            @Value("${telegram.bot-token:}") String botToken,
            @Value("${telegram.web-app-url:}") String webAppUrl
    ) {
        this.restClient = restClientBuilder.baseUrl("https://api.telegram.org").build();
        this.botToken = botToken;
        this.passwordResetUrl = buildPasswordResetUrl(webAppUrl);
    }

    @Override
    public void showMainMenu(long chatId) {
        ReplyKeyboard markup = new ReplyKeyboard(
                List.of(List.of(new KeyboardButton(RECOVERY_ACTION, false))),
                true,
                false
        );
        send(chatId, "Выберите действие. Для восстановления пароля мы подтвердим ваш номер телефона.", markup);
    }

    @Override
    public void requestOwnContact(long chatId) {
        ReplyKeyboard markup = new ReplyKeyboard(
                List.of(List.of(new KeyboardButton("Поделиться моим номером", true))),
                true,
                true
        );
        send(chatId, "Нажмите кнопку ниже и отправьте именно свой контакт. Пароль в чат отправлять не нужно.", markup);
    }

    @Override
    public void showRecoverySuccess(long chatId) {
        if (passwordResetUrl.isBlank()) {
            send(chatId, "Номер подтверждён. Откройте приложение и в профиле выберите «Создать пароль для входа» или «Сменить пароль».",
                    new RemoveKeyboard(true));
            return;
        }
        InlineKeyboard markup = new InlineKeyboard(List.of(List.of(
                new WebAppButton("Открыть приложение и задать пароль", new WebAppInfo(passwordResetUrl))
        )));
        send(chatId, "Номер подтверждён. Задайте новый пароль внутри приложения — не отправляйте его в Telegram-чат.", markup);
    }

    @Override
    public void showRecoveryFailure(long chatId) {
        send(chatId, "Не удалось подтвердить номер. Отправьте свой контакт кнопкой ниже или обратитесь в поддержку.",
                new ReplyKeyboard(List.of(List.of(new KeyboardButton("Поделиться моим номером", true))), true, true));
    }

    private void send(long chatId, String text, Object replyMarkup) {
        if (botToken.isBlank()) {
            log.error("Telegram bot response was not sent: TELEGRAM_BOT_TOKEN is empty");
            return;
        }
        restClient.post()
                .uri("/bot{token}/sendMessage", botToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new SendMessage(chatId, text, replyMarkup))
                .retrieve()
                .toBodilessEntity();
    }

    private static String buildPasswordResetUrl(String webAppUrl) {
        if (webAppUrl == null || webAppUrl.isBlank()) return "";
        String separator = webAppUrl.contains("?") ? "&" : "?";
        return webAppUrl + separator + "passwordReset=1";
    }

    private record SendMessage(@JsonProperty("chat_id") long chatId, String text,
                               @JsonProperty("reply_markup") Object replyMarkup) {}

    private record ReplyKeyboard(List<List<KeyboardButton>> keyboard,
                                 @JsonProperty("resize_keyboard") boolean resizeKeyboard,
                                 @JsonProperty("one_time_keyboard") boolean oneTimeKeyboard) {}

    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private record KeyboardButton(String text, @JsonProperty("request_contact") boolean requestContact) {}

    private record RemoveKeyboard(@JsonProperty("remove_keyboard") boolean removeKeyboard) {}

    private record InlineKeyboard(@JsonProperty("inline_keyboard") List<List<WebAppButton>> inlineKeyboard) {}

    private record WebAppButton(String text, @JsonProperty("web_app") WebAppInfo webApp) {}

    private record WebAppInfo(String url) {}
}
