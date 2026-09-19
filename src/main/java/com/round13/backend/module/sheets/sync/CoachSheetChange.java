package com.round13.backend.module.sheets.sync;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.UUID;

/** Durable identity hints, committed with the user change and retained across sync failures. */
@Entity
@Table(name = "coach_sheet_changes")
@Getter
@NoArgsConstructor
public class CoachSheetChange {
    @Id @GeneratedValue private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "previous_phone", length = 32) private String previousPhone;

    public CoachSheetChange(UUID userId, String previousPhone) {
        this.userId = userId;
        this.previousPhone = previousPhone;
    }
}
