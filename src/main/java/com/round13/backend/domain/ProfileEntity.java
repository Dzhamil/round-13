// src/main/java/com/round13/backend/domain/ProfileEntity.java
package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Профиль пользователя.
 */
@Entity
@Table(
        name = "profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_profiles_user_id", columnNames = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "full_name", length = 256)
    private String fullName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "debut_date")
    private LocalDate debutDate;

    @Column(name = "clan", length = 128)
    private String clan;

    @Column(name = "gender", length = 16)
    private String gender;

    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted;

    /**
     * Поле "О себе".
     * Редактирование контролируется флагом users.phone_verified_by_staff.
     */
    @Column(name = "about_me", columnDefinition = "text")
    private String aboutMe;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
