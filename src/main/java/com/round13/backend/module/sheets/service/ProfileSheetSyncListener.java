package com.round13.backend.module.sheets.service;

import com.round13.backend.module.profile.service.ProfileSaved;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

/** Post-commit exports use independent transactions and the existing active-space lock. */
@Component
@Slf4j
public class ProfileSheetSyncListener {
    private final AllUsersSheetSyncService allUsers;
    private final ParticipantSheetSyncService participants;
    private final TrainerSheetSyncService trainers;
    private final TransactionTemplate transaction;
    private final TaskExecutor executor;

    public ProfileSheetSyncListener(AllUsersSheetSyncService allUsers, ParticipantSheetSyncService participants,
                                    TrainerSheetSyncService trainers, PlatformTransactionManager manager,
                                    @Qualifier("profileSheetExecutor") TaskExecutor executor) {
        this.executor = executor;
        this.allUsers = allUsers;
        this.participants = participants;
        this.trainers = trainers;
        transaction = new TransactionTemplate(manager);
        transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @TransactionalEventListener
    public void onSaved(ProfileSaved event) {
        try {
            executor.execute(() -> export(event));
        } catch (RuntimeException failure) {
            log.error("profile_sheet_sync user_id={} status=not_queued error_type={} retry=next_save_or_manual_sync",
                    event.userId(), failure.getClass().getSimpleName());
        }
    }

    private void export(ProfileSaved event) {
        sync(event, "all_users", () -> allUsers.syncActive());
        sync(event, "participants", () -> participants.syncActive());
        // Includes formerly linked trainers, so existing rows are deactivated when necessary.
        sync(event, "trainers", () -> trainers.syncActive());
    }

    private void sync(ProfileSaved event, String target, Runnable export) {
        try {
            transaction.executeWithoutResult(status -> export.run());
            log.info("profile_sheet_sync user_id={} target={} status=success", event.userId(), target);
        } catch (Exception failure) {
            // Do not print Google response bodies, credentials or profile/contact fields.
            log.error("profile_sheet_sync user_id={} target={} status=failed error_type={} retry=next_save_or_manual_sync",
                    event.userId(), target, failure.getClass().getSimpleName());
        }
    }
}
