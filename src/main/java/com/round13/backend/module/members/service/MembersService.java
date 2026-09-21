package com.round13.backend.module.members.service;

import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.dto.MembersGroup;
import com.round13.backend.module.members.dto.MembersListResponse;
import com.round13.backend.module.members.mapper.MembersMapper;
import com.round13.backend.module.members.repo.MembersReadRepository;
import com.round13.backend.module.members.service.MemberPhoneVisibilityPolicy.PhoneVisibility;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.profile.service.ProfileDisplayName;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Сервис списка участников клуба.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MembersService {

    private final ProfileRepository profileRepository;
    private final MembersReadRepository membersReadRepository;
    private final MembersMapper membersMapper;
    private final MemberPointsCacheService memberPointsCacheService;
    private final MemberPhoneVisibilityPolicy memberPhoneVisibilityPolicy;

    public MembersListResponse getMembers(MembersGroup group, UUID viewerUserId) {
        List<MemberListItemRow> rows = switch (group) {
            case FIGHTERS -> membersReadRepository.findFighters();
            case COACHES -> membersReadRepository.findCoaches();
        };

        return refreshAndEnrich(rows, viewerUserId, false);
    }

    public MembersListResponse getMyStudents(UUID trainerId) {
        List<MemberListItemRow> rows = membersReadRepository.findStudentsByTrainerId(trainerId);
        return refreshAndEnrich(rows, trainerId, false);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public MembersListResponse getTrainerStudentLinksForAdmin(UUID trainerId) {
        List<MemberListItemRow> rows = membersReadRepository.findStudentLinksForAdmin(trainerId);
        return refreshAndEnrich(rows, null, true);
    }

    private MembersListResponse mapRowsForViewer(List<MemberListItemRow> rows, UUID viewerUserId) {
        return new MembersListResponse(
                rows.stream()
                        .map(row -> membersMapper.toListItem(
                                row,
                                memberPhoneVisibilityPolicy.resolve(
                                        row.id(),
                                        row.phone(),
                                        row.phoneHidden(),
                                        viewerUserId
                                )
                        ))
                        .toList()
        );
    }

    private MembersListResponse mapRowsForAdmin(List<MemberListItemRow> rows) {
        return new MembersListResponse(
                rows.stream()
                        .map(row -> membersMapper.toListItem(
                                row,
                                new PhoneVisibility(row.phone(), row.phoneHidden())
                        ))
                        .toList()
        );
    }

    private MembersListResponse refreshAndEnrich(List<MemberListItemRow> rows, UUID viewerId, boolean admin) {
        MembersListResponse response = admin ? mapRowsForAdmin(rows) : mapRowsForViewer(rows, viewerId);
        var ids = new HashSet<UUID>();
        response.getItems().forEach(item -> {
            ids.add(UUID.fromString(item.getId()));
            if (item.getTrainerId() != null) ids.add(UUID.fromString(item.getTrainerId()));
        });
        if (ids.isEmpty()) return response;
        var profiles = profileRepository.findByUserIdIn(List.copyOf(ids)).stream().collect(
                Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));
        var stats = memberPointsCacheService.recalcForUsers(rows.stream().map(MemberListItemRow::id).distinct().toList(), profiles);
        response.getItems().forEach(item -> {
            var updated = stats.get(UUID.fromString(item.getId()));
            if (updated != null) {
                item.setPoints(updated.getPoints());
                item.setStatusLabel(updated.getStatusLabel());
            }
            item.setDisplayName(ProfileDisplayName.resolve(
                    profiles.get(UUID.fromString(item.getId())), item.getNickname(), item.getPhone()));
            if (item.getTrainerId() != null) item.setTrainerName(
                    ProfileDisplayName.resolve(
                            profiles.get(UUID.fromString(item.getTrainerId())), item.getTrainerName(), null));
        });
        return response;
    }

}
