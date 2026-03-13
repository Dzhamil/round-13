package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Роль пользователя, определяющая уровень доступа и доступный функционал.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleEntity {

    /**
     * Идентификатор роли.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Код роли (ATHLETE/COACH/ADMIN).
     */
    @Column(nullable = false, unique = true, length = 32)
    private String code;
}
