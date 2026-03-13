package com.round13.backend.module.info.service;

import com.round13.backend.module.info.dto.ClubEventResponse;
import com.round13.backend.module.info.mapper.ClubEventMapper;
import com.round13.backend.module.info.repo.ClubEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final ClubEventMapper clubEventMapper;

    @Transactional(readOnly = true)
    public List<ClubEventResponse> getUpcoming() {
        return clubEventRepository.findUpcoming(OffsetDateTime.now()).stream()
                .map(clubEventMapper::toResponse)
                .toList();
    }
}
