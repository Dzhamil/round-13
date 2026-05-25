package com.round13.backend.module.profile.service;

import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserEntitlementEntity;
import com.round13.backend.domain.UserEntitlementType;
import com.round13.backend.domain.UserTrainerLinkEntity;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.dto.ProfileEntitlementResponse;
import com.round13.backend.module.profile.mapper.ProfileEntitlementMapper;
import com.round13.backend.module.shop.repo.UserEntitlementRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileEntitlementService {

    private static final int EMPTY_BALANCE = 0;
    private static final String UNKNOWN_TRAINER_LABEL = "Не назначен";

    private final UserTrainerLinkRepository userTrainerLinkRepository;
    private final UserEntitlementRepository userEntitlementRepository;
    private final UserRepository userRepository;
    private final ProfileEntitlementMapper profileEntitlementMapper;

    @Transactional(readOnly = true)
    public List<ProfileEntitlementResponse> getActiveEntitlements(UUID userId) {
        List<ProfileEntitlementResponse> result = new ArrayList<>();
        result.addAll(loadPersonalBalances(userId));
        result.addAll(loadGroupPackages(userId));
        return result;
    }

    private List<ProfileEntitlementResponse> loadPersonalBalances(UUID userId) {
        List<UserTrainerLinkEntity> links = userTrainerLinkRepository
                .findByStudentIdAndRemainingTrainingsGreaterThanOrderByCreatedAtDesc(userId, EMPTY_BALANCE);
        if (links.isEmpty()) {
            return List.of();
        }

        Map<UUID, UserEntity> trainersById = userRepository.findAllById(
                        links.stream()
                                .map(UserTrainerLinkEntity::getTrainerId)
                                .distinct()
                                .toList()
                ).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        return links.stream()
                .map(link -> profileEntitlementMapper.toPersonalPackage(
                        link,
                        resolveTrainerLabel(trainersById.get(link.getTrainerId()))
                ))
                .toList();
    }

    private List<ProfileEntitlementResponse> loadGroupPackages(UUID userId) {
        List<UserEntitlementEntity> entitlements = userEntitlementRepository.findActiveByUserIdAndType(userId, UserEntitlementType.GROUP_TRAININGS);
        if (entitlements.isEmpty()) {
            return List.of();
        }

        Map<UUID, UserEntity> trainersById = userRepository.findAllById(
                        entitlements.stream()
                                .map(UserEntitlementEntity::getTrainerId)
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .toList()
                ).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        return entitlements
                .stream()
                .map(entity -> mapGroupEntitlement(entity, trainersById))
                .toList();
    }

    private ProfileEntitlementResponse mapGroupEntitlement(UserEntitlementEntity entity, Map<UUID, UserEntity> trainersById) {
        return profileEntitlementMapper.toGroupPackage(
                entity,
                profileEntitlementMapper.resolveGroupTitle(entity),
                entity.remainingQuantityOrZero(),
                resolveTrainerLabel(trainersById.get(entity.getTrainerId()))
        );
    }

    private String resolveTrainerLabel(UserEntity trainer) {
        if (trainer == null) {
            return UNKNOWN_TRAINER_LABEL;
        }
        if (trainer.getNickname() != null && !trainer.getNickname().isBlank()) {
            return trainer.getNickname();
        }
        if (!trainer.isPhoneHidden() && trainer.getPhone() != null && !trainer.getPhone().isBlank()) {
            return trainer.getPhone();
        }
        return UNKNOWN_TRAINER_LABEL;
    }
}
