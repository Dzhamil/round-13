package com.round13.backend.module.admin.service;

import com.round13.backend.domain.ClubEventEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.dto.CreateClubEventRequest;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventRepository;
import com.round13.backend.module.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final ClubEventMapper clubEventMapper;
    private final UserRepository userRepository;

    @Transactional
    public UUID create(UUID adminUserId, CreateClubEventRequest request) {
        if (!request.getEndsAt().isAfter(request.getStartsAt())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        UserEntity admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ClubEventEntity entity = clubEventMapper.create(request);
        entity.setCreatedBy(admin);

        clubEventRepository.save(entity);
        return entity.getId();
    }
}
