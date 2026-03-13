package com.round13.backend.module.profile.service;

import com.round13.backend.module.members.repo.TrainingBalanceEventRepository;
import com.round13.backend.module.profile.dto.ProfileEntitlementActivityResponse;
import com.round13.backend.module.profile.dto.ProfileGroupEntitlementActivityRow;
import com.round13.backend.module.profile.dto.ProfilePersonalEntitlementActivityRow;
import com.round13.backend.module.profile.mapper.ProfileEntitlementActivityMapper;
import com.round13.backend.module.shop.repo.UserEntitlementEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileEntitlementActivityService {

    private static final int HISTORY_LIMIT = 10;

    private final TrainingBalanceEventRepository trainingBalanceEventRepository;
    private final UserEntitlementEventRepository userEntitlementEventRepository;
    private final ProfileEntitlementActivityMapper profileEntitlementActivityMapper;

    @Transactional(readOnly = true)
    public List<ProfileEntitlementActivityResponse> getRecentActivity(UUID userId) {
        PageRequest pageRequest = PageRequest.of(0, HISTORY_LIMIT);

        List<ProfileEntitlementActivityResponse> personalActivity = trainingBalanceEventRepository
                .findRecentByStudentId(userId, pageRequest)
                .stream()
                .map(profileEntitlementActivityMapper::fromPersonalRow)
                .toList();

        List<ProfileEntitlementActivityResponse> groupActivity = userEntitlementEventRepository
                .findRecentByUserId(userId, pageRequest)
                .stream()
                .map(profileEntitlementActivityMapper::fromGroupRow)
                .toList();

        return java.util.stream.Stream.concat(personalActivity.stream(), groupActivity.stream())
                .sorted(Comparator.comparing(ProfileEntitlementActivityResponse::occurredAt).reversed())
                .limit(HISTORY_LIMIT)
                .toList();
    }
}
