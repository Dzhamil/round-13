package com.round13.backend.module.members.service;

import com.round13.backend.module.members.dto.MemberListItemRow;
import com.round13.backend.module.members.dto.MembersGroup;
import com.round13.backend.module.members.dto.MembersListResponse;
import com.round13.backend.module.members.mapper.MembersMapper;
import com.round13.backend.module.members.repo.MembersReadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public MembersListResponse getMembers(MembersGroup group) {
        List<MemberListItemRow> rows = switch (group) {
            case FIGHTERS -> membersReadRepository.findFighters();
            case COACHES -> membersReadRepository.findCoaches();
        };

        return mapRows(rows);
    }

    public MembersListResponse getMyStudents(UUID trainerId) {
        List<MemberListItemRow> rows = membersReadRepository.findStudentsByTrainerId(trainerId);
        return mapRows(rows);
    }

    private MembersListResponse mapRows(List<MemberListItemRow> rows) {
        return new MembersListResponse(
                rows.stream()
                        .map(membersMapper::toListItem)
                        .toList()
        );
    }
}