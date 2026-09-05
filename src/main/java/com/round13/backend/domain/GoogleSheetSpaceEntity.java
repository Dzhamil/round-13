package com.round13.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "google_sheet_spaces")
@Getter @Setter @NoArgsConstructor
public class GoogleSheetSpaceEntity {
    @Id @GeneratedValue private UUID id;
    @Column(name = "display_name", nullable = false, length = 160) private String displayName;
    @Column(name = "spreadsheet_url", nullable = false, columnDefinition = "text") private String spreadsheetUrl;
    @Column(name = "spreadsheet_id", nullable = false, length = 160) private String spreadsheetId;
    @Column(name = "service_account_email", length = 320) private String serviceAccountEmail;
    @Column(name = "credentials_env_var", length = 128) private String credentialsEnvVar;
    @Column(name = "access_details", columnDefinition = "text") private String accessDetails;
    @Column(nullable = false) private boolean active;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
}
