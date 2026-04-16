package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    public static final boolean DEFAULT_PROFILE_COMPLETED = false;

    private static final int FULL_NAME_MAX_LENGTH = 256;
    private static final int CLAN_MAX_LENGTH = 128;
    private static final int GENDER_MAX_LENGTH = 16;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "full_name", length = FULL_NAME_MAX_LENGTH)
    private String fullName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "debut_date")
    private LocalDate debutDate;

    @Column(name = "clan", length = CLAN_MAX_LENGTH)
    private String clan;

    @Column(name = "gender", length = GENDER_MAX_LENGTH)
    private String gender;

    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted = DEFAULT_PROFILE_COMPLETED;

    /**
     * Поле "О себе".
     * Редактирование контролируется флагом users.phone_verified_by_staff.
     */
    @Column(name = "about_me", columnDefinition = "text")
    private String aboutMe;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
