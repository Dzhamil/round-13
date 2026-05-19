package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    private static final int PHONE_MAX_LENGTH = 32;
    private static final int NICKNAME_MAX_LENGTH = 64;
    private static final int STATUS_MAX_LENGTH = 16;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "phone", unique = true, length = PHONE_MAX_LENGTH)
    private String phone;

    @Column(name = "nickname", unique = true, length = NICKNAME_MAX_LENGTH)
    private String nickname;

    @Column(name = "password_hash")
    private String passwordHash;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = STATUS_MAX_LENGTH)
    private UserStatus status;

    @Column(name = "telegram_user_id", unique = true)
    private Long telegramUserId;

    /**
     * Телефон верифицирован тренером или админом.
     */
    @Column(name = "phone_verified_by_staff", nullable = false)
    private boolean phoneVerifiedByStaff;

    @Column(name = "phone_hidden", nullable = false)
    private boolean phoneHidden;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public boolean isBlocked() {
        return status == UserStatus.BLOCKED;
    }

    public boolean isProfileIncomplete() {
        return status == UserStatus.PROFILE_INCOMPLETE;
    }

    public void activate() {
        status = UserStatus.ACTIVE;
    }
}
