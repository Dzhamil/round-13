package com.round13.backend.module.sheets.service;

import com.round13.backend.module.profile.service.ProfileSaved;
import org.junit.jupiter.api.Test;
import org.springframework.core.task.TaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.SimpleTransactionStatus;
import java.util.UUID;
import java.util.concurrent.RejectedExecutionException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileSheetSyncListenerTest {
    @Test
    void exportsRunOutsideRequestThreadAndEachUsesANewTransaction() {
        var users = mock(AllUsersSheetSyncService.class);
        var participants = mock(ParticipantSheetSyncService.class);
        var trainers = mock(TrainerSheetSyncService.class);
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenAnswer(call -> new SimpleTransactionStatus());
        var executor = mock(TaskExecutor.class);
        var listener = new ProfileSheetSyncListener(users, participants, trainers, manager, executor);
        listener.onSaved(new ProfileSaved(UUID.randomUUID()));
        var task = org.mockito.ArgumentCaptor.forClass(Runnable.class);
        verify(executor).execute(task.capture());
        verifyNoInteractions(users, participants, trainers);
        when(users.syncActive()).thenThrow(new IllegalStateException("unavailable"));
        assertThatCode(task.getValue()::run).doesNotThrowAnyException();
        verify(participants).syncActive();
        verify(trainers).syncActive();
        verify(manager, times(3)).getTransaction(argThat(definition ->
                definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW));
        verify(manager).rollback(any());
        verify(manager, times(2)).commit(any());
    }

    @Test
    void fullQueueCannotFailCommittedProfile() {
        var executor = mock(TaskExecutor.class);
        doThrow(new RejectedExecutionException()).when(executor).execute(any());
        var listener = new ProfileSheetSyncListener(mock(AllUsersSheetSyncService.class),
                mock(ParticipantSheetSyncService.class), mock(TrainerSheetSyncService.class),
                mock(PlatformTransactionManager.class), executor);
        assertThatCode(() -> listener.onSaved(new ProfileSaved(UUID.randomUUID()))).doesNotThrowAnyException();
    }
}
