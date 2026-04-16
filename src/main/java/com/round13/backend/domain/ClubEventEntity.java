package com.round13.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "club_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClubEventEntity {

    private static final int TITLE_MAX_LENGTH = 256;
    private static final int TYPE_MAX_LENGTH = 32;
    private static final int LOCATION_MAX_LENGTH = 256;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = TITLE_MAX_LENGTH)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "type", nullable = false, length = TYPE_MAX_LENGTH)
    private String type;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private OffsetDateTime endsAt;

    @Column(name = "location", length = LOCATION_MAX_LENGTH)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_user_id")
    private UserEntity trainer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public boolean hasType(String expectedType) {
        return expectedType != null && expectedType.equals(type);
    }

    public boolean startsAfter(OffsetDateTime dateTime) {
        return startsAt != null && dateTime != null && startsAt.isAfter(dateTime);
    }
}
