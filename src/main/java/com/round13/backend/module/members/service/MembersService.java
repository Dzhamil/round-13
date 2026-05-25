package com.round13.backend.module.members.service;

import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.dto.MembersGroup;
import com.round13.backend.module.members.dto.MembersListResponse;
import com.round13.backend.module.members.mapper.MembersMapper;
import com.round13.backend.module.members.repo.MembersReadRepository;
import com.round13.backend.module.members.service.MemberPhoneVisibilityPolicy.PhoneVisibility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Сервис списка участников клуба.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MembersService {

    private final MembersReadRepository membersReadRepository;
    private final MembersMapper membersMapper;
    private final MemberPointsCacheService memberPointsCacheService;
    private final MemberPhoneVisibilityPolicy memberPhoneVisibilityPolicy;

    public MembersListResponse getMembers(MembersGroup group, UUID viewerUserId) {
        List<MemberListItemRow> rows = switch (group) {
            case FIGHTERS -> membersReadRepository.findFighters();
            case COACHES -> membersReadRepository.findCoaches();
        };

        memberPointsCacheService.recalcForUsers(rows.stream().map(MemberListItemRow::id).toList());

        rows = switch (group) {
            case FIGHTERS -> membersReadRepository.findFighters();
            case COACHES -> membersReadRepository.findCoaches();
        };

        return mapRowsForViewer(rows, viewerUserId);
    }

    public MembersListResponse getMyStudents(UUID trainerId) {
        List<MemberListItemRow> rows = membersReadRepository.findStudentsByTrainerId(trainerId);
        memberPointsCacheService.recalcForUsers(rows.stream().map(MemberListItemRow::id).toList());
        rows = membersReadRepository.findStudentsByTrainerId(trainerId);
        return mapRowsForViewer(rows, trainerId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public MembersListResponse getTrainerStudentLinksForAdmin(UUID trainerId) {
        List<MemberListItemRow> rows = membersReadRepository.findStudentLinksForAdmin(trainerId);
        memberPointsCacheService.recalcForUsers(rows.stream().map(MemberListItemRow::id).toList());
        rows = membersReadRepository.findStudentLinksForAdmin(trainerId);
        return mapRowsForAdmin(rows);
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
}
