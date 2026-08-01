package com.round13.backend.module.loyalty.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointEntryEntity;
import com.round13.backend.module.loyalty.domain.LoyaltyPointSourceType;
import com.round13.backend.module.loyalty.repo.LoyaltyPointEntryRepository;
import com.round13.backend.module.user.repo.UserRepository;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoyaltyPointLedgerServiceTest {

    private final LoyaltyPointEntryRepository entryRepository = mock(LoyaltyPointEntryRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final LoyaltyTotalsService totalsService = mock(LoyaltyTotalsService.class);
    private final LoyaltyPointLedgerService service = new LoyaltyPointLedgerService(
            entryRepository,
            userRepository,
            totalsService
    );

    @Test
    void createEntryReturnsExistingEntryForIdempotencyKey() {
        LoyaltyPointEntryEntity existing = new LoyaltyPointEntryEntity();
        when(entryRepository.findByIdempotencyKey("same-key")).thenReturn(Optional.of(existing));

        LoyaltyPointEntryEntity result = service.createEntry(command("same-key"));

        assertThat(result).isSameAs(existing);
        verify(entryRepository, never()).saveAndFlush(any());
    }

    @Test
    void createEntryPersistsNewEntryAndRecomputesTotals() {
        UUID memberId = UUID.randomUUID();
        UserEntity member = new UserEntity();
        member.setId(memberId);
        when(entryRepository.findByIdempotencyKey("new-key")).thenReturn(Optional.empty());
        when(userRepository.findByIdWithRole(memberId)).thenReturn(Optional.of(member));
        when(entryRepository.saveAndFlush(any(LoyaltyPointEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoyaltyPointEntryEntity result = service.createEntry(new LoyaltyEntryCommand(
                memberId,
                LoyaltyPointSourceType.CLUB_EVENT_ATTENDANCE,
                10,
                OffsetDateTime.now(),
                null,
                null,
                null,
                "event",
                "club.event.attendance",
                1,
                "new-key",
                Map.of(),
                null,
                null
        ));

        assertThat(result.getPointsDelta()).isEqualTo(10);
        assertThat(result.getMember()).isSameAs(member);
        verify(totalsService).recomputeForMember(member);
    }

    @Test
    void correctEntryCreatesCompensatingCorrectionForOriginalMember() {
        UUID entryId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        UserEntity member = new UserEntity();
        member.setId(memberId);
        LoyaltyPointEntryEntity original = new LoyaltyPointEntryEntity();
        original.setId(entryId);
        original.setMember(member);
        original.setPointsDelta(10);

        when(entryRepository.findById(entryId)).thenReturn(Optional.of(original));
        when(entryRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userRepository.findByIdWithRole(memberId)).thenReturn(Optional.of(member));
        when(entryRepository.saveAndFlush(any(LoyaltyPointEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoyaltyPointEntryEntity correction = service.correctEntry(
                entryId,
                -4,
                actorId,
                OffsetDateTime.now(),
                "adjust",
                Map.of()
        );

        assertThat(correction.getSourceType()).isEqualTo(LoyaltyPointSourceType.CORRECTION);
        assertThat(correction.getPointsDelta()).isEqualTo(-4);
        assertThat(correction.getCorrectionOfEntry()).isSameAs(original);
        verify(totalsService).recomputeForMember(member);
    }

    @Test
    void revokeEntryCreatesSingleReversalForOriginalDelta() {
        UUID entryId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        UserEntity member = new UserEntity();
        member.setId(memberId);
        LoyaltyPointEntryEntity original = new LoyaltyPointEntryEntity();
        original.setId(entryId);
        original.setMember(member);
        original.setPointsDelta(50);
        original.setSourceType(LoyaltyPointSourceType.RECRUITMENT);

        when(entryRepository.findById(entryId)).thenReturn(Optional.of(original));
        when(entryRepository.existsByRevokedEntry_Id(entryId)).thenReturn(false);
        when(entryRepository.findByIdempotencyKey("reversal:%s".formatted(entryId))).thenReturn(Optional.empty());
        when(userRepository.findByIdWithRole(memberId)).thenReturn(Optional.of(member));
        when(entryRepository.saveAndFlush(any(LoyaltyPointEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoyaltyPointEntryEntity reversal = service.revokeEntry(
                entryId,
                UUID.randomUUID(),
                OffsetDateTime.now(),
                "revoke",
                Map.of()
        );

        assertThat(reversal.getSourceType()).isEqualTo(LoyaltyPointSourceType.REVERSAL);
        assertThat(reversal.getPointsDelta()).isEqualTo(-50);
        assertThat(reversal.getRevokedEntry()).isSameAs(original);
        verify(totalsService).recomputeForMember(member);
    }

    private LoyaltyEntryCommand command(String idempotencyKey) {
        return new LoyaltyEntryCommand(
                UUID.randomUUID(),
                LoyaltyPointSourceType.TRAINING_VISIT,
                2,
                OffsetDateTime.now(),
                UUID.randomUUID(),
                "training_participants",
                UUID.randomUUID(),
                "visit",
                "training.visit.attended",
                1,
                idempotencyKey,
                Map.of(),
                null,
                null
        );
    }
}
