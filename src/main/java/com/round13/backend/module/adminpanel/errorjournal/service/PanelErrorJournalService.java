package com.round13.backend.module.adminpanel.errorjournal.service;

import com.round13.backend.domain.CriticalErrorEventEntity;
import com.round13.backend.domain.CriticalErrorStatus;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalDetailResponse;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalListItemResponse;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalListRequest;
import com.round13.backend.module.adminpanel.errorjournal.dto.ErrorJournalPageResponse;
import com.round13.backend.module.adminpanel.errorjournal.repo.CriticalErrorEventRepository;
import com.round13.backend.module.adminpanel.errorjournal.sanitize.ErrorJournalSanitizer;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PanelErrorJournalService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 25;
    private static final int MAX_SIZE = 100;

    private final CriticalErrorEventRepository repository;
    private final ErrorJournalSanitizer sanitizer;

    @Transactional(readOnly = true)
    public ErrorJournalPageResponse list(ErrorJournalListRequest request) {
        int page = boundedPage(request.page());
        int size = boundedSize(request.size());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));

        Page<CriticalErrorEventEntity> result = repository.findAll(toSpecification(request), pageRequest);
        return new ErrorJournalPageResponse(
                result.getContent().stream().map(this::toListItem).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public ErrorJournalDetailResponse detail(UUID id) {
        return repository.findById(id)
                .map(this::toDetail)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERROR_JOURNAL_EVENT_NOT_FOUND));
    }

    @Transactional
    public ErrorJournalDetailResponse updateStatus(UUID id, CriticalErrorStatus status, String note, UUID panelAdminId) {
        CriticalErrorEventEntity event = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERROR_JOURNAL_EVENT_NOT_FOUND));

        event.setStatus(status);
        if (status == CriticalErrorStatus.OPEN) {
            event.setResolvedAt(null);
            event.setResolvedByUserId(null);
            event.setResolutionNote(null);
        } else {
            event.setResolvedAt(OffsetDateTime.now());
            event.setResolvedByUserId(panelAdminId);
            event.setResolutionNote(sanitizer.resolutionNote(note));
        }

        return toDetail(repository.save(event));
    }

    private Specification<CriticalErrorEventEntity> toSpecification(ErrorJournalListRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.status() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.status()));
            }
            if (request.severity() != null) {
                predicates.add(criteriaBuilder.equal(root.get("severity"), request.severity()));
            }
            if (request.source() != null) {
                predicates.add(criteriaBuilder.equal(root.get("source"), request.source()));
            }
            if (request.httpStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("httpStatus"), request.httpStatus()));
            }
            if (request.from() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("occurredAt"), request.from()));
            }
            if (request.to() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("occurredAt"), request.to()));
            }
            if (notBlank(request.path())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("requestPath")),
                        contains(request.path())
                ));
            }
            if (notBlank(request.errorCode())) {
                predicates.add(criteriaBuilder.equal(root.get("errorCode"), sanitizer.shortValue(request.errorCode().trim(), 64)));
            }
            if (notBlank(request.q())) {
                String q = contains(request.q());
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("message")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("exceptionClass")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("requestPath")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("requestId")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("fingerprint")), q)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private ErrorJournalListItemResponse toListItem(CriticalErrorEventEntity event) {
        return new ErrorJournalListItemResponse(
                event.getId(),
                event.getOccurredAt(),
                event.getSeverity(),
                event.getSource(),
                event.getStatus(),
                event.getErrorCode(),
                event.getHttpStatus(),
                event.getExceptionClass(),
                event.getMessage(),
                event.getRequestMethod(),
                event.getRequestPath(),
                event.getActorUserId(),
                event.getPanelAdminId(),
                event.getRequestId(),
                event.getFingerprint()
        );
    }

    private ErrorJournalDetailResponse toDetail(CriticalErrorEventEntity event) {
        return new ErrorJournalDetailResponse(
                event.getId(),
                event.getOccurredAt(),
                event.getCreatedAt(),
                event.getSeverity(),
                event.getSource(),
                event.getStatus(),
                event.getErrorCode(),
                event.getHttpStatus(),
                event.getExceptionClass(),
                event.getErrorType(),
                event.getMessage(),
                event.getStackTrace(),
                event.getRequestMethod(),
                event.getRequestPath(),
                event.getQueryString(),
                event.getRequestId(),
                event.getFingerprint(),
                event.getActorUserId(),
                event.getPanelAdminId(),
                event.getRemoteAddr(),
                event.getUserAgent(),
                event.getResolutionNote(),
                event.getResolvedAt(),
                event.getResolvedByUserId()
        );
    }

    private int boundedPage(Integer page) {
        return page == null || page < 0 ? DEFAULT_PAGE : page;
    }

    private int boundedSize(Integer size) {
        if (size == null) {
            return DEFAULT_SIZE;
        }

        return Math.min(Math.max(size, 1), MAX_SIZE);
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private String contains(String value) {
        String sanitized = sanitizer.shortValue(value.trim(), 128).toLowerCase(Locale.ROOT);
        return "%" + sanitized.replace("%", "\\%").replace("_", "\\_") + "%";
    }
}
