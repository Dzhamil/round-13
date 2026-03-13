package com.round13.backend.module.admin.service;

import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.info.repo.ClubEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminClubEventDeleteService {

    private final ClubEventRepository clubEventRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(UUID eventId) {
        if (!clubEventRepository.existsById(eventId)) {
            throw new BusinessException(ErrorCode.CLUB_EVENT_NOT_FOUND);
        }

        clubEventRepository.deleteById(eventId);
    }
}
