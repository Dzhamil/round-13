package com.round13.backend.module.sheets.sync;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CoachSheetChangeRepository extends JpaRepository<CoachSheetChange, UUID> {}
