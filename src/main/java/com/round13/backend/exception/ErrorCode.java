package com.round13.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Перечень бизнес-кодов ошибок приложения.
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    /**
     * Администратор пытается заблокировать самого себя.
     */
    ADMIN_CANNOT_BLOCK_SELF(
            "Администратор не может заблокировать самого себя",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Администратор пытается изменить роль самому себе.
     */
    ADMIN_CANNOT_CHANGE_OWN_ROLE(
            "Администратор не может изменить роль самому себе",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Некорректный refresh-токен.
     */
    INVALID_REFRESH_TOKEN(
            "Некорректный refresh-токен",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Некорректные или поддельные данные Telegram initData.
     */
    INVALID_TELEGRAM_INIT_DATA(
            "Некорректные данные Telegram",
            HttpStatus.UNAUTHORIZED
    ),

    /**
     * Внутренняя ошибка сервера.
     */
    INTERNAL_ERROR(
            "Внутренняя ошибка сервера",
            HttpStatus.INTERNAL_SERVER_ERROR
    ),

    /**
     * Refresh-токен не найден.
     */
    REFRESH_TOKEN_NOT_FOUND(
            "Refresh-токен не найден",
            HttpStatus.NOT_FOUND
    ),

    /**
     * Refresh-токен отозван.
     */
    REFRESH_TOKEN_REVOKED(
            "Refresh-токен отозван",
            HttpStatus.UNAUTHORIZED
    ),

    /**
     * Refresh-токен истёк.
     */
    REFRESH_TOKEN_EXPIRED(
            "Refresh-токен истёк",
            HttpStatus.UNAUTHORIZED
    ),

    /**
     * Неверные учетные данные пользователя.
     */
    INVALID_CREDENTIALS(
            "Неверный логин или пароль",
            HttpStatus.UNAUTHORIZED
    ),

    /**
     * Пользователь заблокирован.
     */
    USER_BLOCKED(
            "Пользователь заблокирован",
            HttpStatus.FORBIDDEN
    ),

    /**
     * Пользователь деактивировал профиль.
     */
    USER_DELETED(
            "Профиль деактивирован",
            HttpStatus.FORBIDDEN
    ),

    USER_NOT_FOUND(
            "Пользователь не найден",
            HttpStatus.NOT_FOUND
    ),

    PROFILE_NOT_FOUND(
            "Профиль не найден",
            HttpStatus.NOT_FOUND
    ),

    BOXER_POTENTIAL_PROFILE_INCOMPLETE(
            "Заполните дату рождения участника перед замером потенциала",
            HttpStatus.BAD_REQUEST
    ),

    BOXER_POTENTIAL_GENDER_REQUIRED(
            "Заполните пол участника перед замером потенциала",
            HttpStatus.BAD_REQUEST
    ),

    BOXER_POTENTIAL_UNSUPPORTED_GENDER(
            "Для замера потенциала укажите пол MALE или FEMALE",
            HttpStatus.BAD_REQUEST
    ),

    BOXER_POTENTIAL_FORBIDDEN(
            "Недостаточно прав для потенциала боксера",
            HttpStatus.FORBIDDEN
    ),

    BOXER_POTENTIAL_TARGET_FORBIDDEN(
            "Замер потенциала доступен только для бойцов",
            HttpStatus.BAD_REQUEST
    ),

    ROLE_NOT_FOUND(
            "Роль не найдена",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Правило не найдено.
     */
    RULE_NOT_FOUND(
            "Правило не найдено",
            HttpStatus.NOT_FOUND
    ),

    /**
     * Правило с таким кодом уже существует.
     */
    RULE_CODE_EXISTS(
            "Правило с таким кодом уже существует",
            HttpStatus.CONFLICT
    ),

    PHONE_EXISTS(
            "Пользователь с таким телефоном уже существует",
            HttpStatus.CONFLICT
    ),

    NICKNAME_EXISTS(
            "Пользователь с таким никнеймом уже существует",
            HttpStatus.CONFLICT
    ),

    /**
     * Информационная страница не найдена.
     */
    PAGE_NOT_FOUND(
            "Информационная страница не найдена",
            HttpStatus.NOT_FOUND
    ),

    CLUB_EVENT_NOT_FOUND(
            "Событие не найдено",
            HttpStatus.NOT_FOUND
    ),

    CLUB_EVENT_FORBIDDEN(
            "Недостаточно прав для управления событием",
            HttpStatus.FORBIDDEN
    ),

    CLUB_EVENT_ALREADY_JOINED(
            "Вы уже участвуете в событии",
            HttpStatus.BAD_REQUEST
    ),

    CLUB_EVENT_PARTICIPATION_NOT_FOUND(
            "Участие в событии не найдено",
            HttpStatus.NOT_FOUND
    ),

    // -------------------------------------------------------------------------
    // Раздел: Тренировочные сессии
    // -------------------------------------------------------------------------

    /**
     * Тренировочная сессия не найдена.
     */
    SESSION_NOT_FOUND(
            "Тренировка не найдена",
            HttpStatus.NOT_FOUND
    ),

    /**
     * Пользователь уже записан на тренировку.
     */
    ALREADY_JOINED(
            "Вы уже записаны на эту тренировку",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Свободных мест на тренировке больше нет.
     */
    SESSION_FULL(
            "Свободных мест на тренировку больше нет",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Тренировка уже началась, операция невозможна.
     */
    SESSION_ALREADY_STARTED(
            "Невозможно выполнить операцию: тренировка уже началась",
            HttpStatus.BAD_REQUEST
    ),

    /**
     * Запись участия пользователя в тренировке не найдена.
     */
    PARTICIPATION_NOT_FOUND(
            "Запись на тренировку не найдена",
            HttpStatus.NOT_FOUND
    ),

    /**
     * На выбранное время уже существует другая тренировка.
     */
    TRAINING_TIME_SLOT_BUSY(
            "На это время уже назначена тренировка",
            HttpStatus.BAD_REQUEST
    ),

    // -------------------------------------------------------------------------
    // Раздел: Магазин
    // -------------------------------------------------------------------------

    /**
     * Товар магазина не найден (не существует или не активен).
     */
    SHOP_PRODUCT_NOT_FOUND(
            "Товар не найден",
            HttpStatus.NOT_FOUND
    ),

    /**
     * Заказ магазина не найден.
     */
    SHOP_ORDER_NOT_FOUND(
            "Заказ не найден",
            HttpStatus.NOT_FOUND
    ),

    /**
     * Аккаунт администратора панели отключён
     */
    PANEL_ADMIN_DISABLED(
            "Аккаунт администратора панели отключён",
            HttpStatus.FORBIDDEN
    ),

    // Раздел: Магазин
    SHOP_CATEGORY_NOT_FOUND(
            "Категория не найдена",
            HttpStatus.NOT_FOUND
    ),
    SHOP_CATEGORY_EXISTS(
            "Категория с таким названием уже существует",
            HttpStatus.CONFLICT
    ),

    GROUP_TRAINING_PACKAGE_REQUIRED(
            "Для записи нужна активная групповая тренировка",
            HttpStatus.BAD_REQUEST
    ),


    /**
     * Некорректные параметры запроса.
     */
    INVALID_REQUEST(
            "Некорректный запрос",
            HttpStatus.BAD_REQUEST
    );

    private final String message;
    private final HttpStatus httpStatus;

    public String getCode() {
        return name();
    }
}
