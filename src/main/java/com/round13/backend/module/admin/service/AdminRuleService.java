package com.round13.backend.module.admin.service;

import com.round13.backend.domain.RuleEntity;
import com.round13.backend.module.admin.dto.UpsertRuleRequest;
import com.round13.backend.module.rule.dto.RuleResponse;
import com.round13.backend.exception.BusinessException;
import com.round13.backend.exception.ErrorCode;
import com.round13.backend.module.rule.mapper.RuleMapper;
import com.round13.backend.module.rule.repo.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Сервис администрирования правил клуба.
 */
@Service
@RequiredArgsConstructor
public class AdminRuleService {

    private final RuleRepository ruleRepository;
    private final RuleMapper ruleMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<RuleResponse> getRules() {
        return ruleMapper.toResponseList(ruleRepository.findAllByOrderBySortOrderAsc());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public RuleResponse getRule(UUID id) {
        RuleEntity entity = ruleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RULE_NOT_FOUND));
        return ruleMapper.toResponse(entity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UUID create(UpsertRuleRequest request) {
        String code = normalize(request.getCode());
        if (ruleRepository.existsByCode(code)) {
            throw new BusinessException(ErrorCode.RULE_CODE_EXISTS);
        }

        RuleEntity entity = new RuleEntity();
        entity.setCode(code);
        entity.setTitle(normalize(request.getTitle()));
        entity.setContent(normalize(request.getContent()));
        entity.setSortOrder(request.getSortOrder());

        ruleRepository.save(entity);
        return entity.getId();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void update(UUID id, UpsertRuleRequest request) {
        RuleEntity entity = ruleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RULE_NOT_FOUND));

        String code = normalize(request.getCode());
        if (!entity.getCode().equals(code) && ruleRepository.existsByCode(code)) {
            throw new BusinessException(ErrorCode.RULE_CODE_EXISTS);
        }

        entity.setCode(code);
        entity.setTitle(normalize(request.getTitle()));
        entity.setContent(normalize(request.getContent()));
        entity.setSortOrder(request.getSortOrder());

        ruleRepository.save(entity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(UUID id) {
        if (!ruleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.RULE_NOT_FOUND);
        }
        ruleRepository.deleteById(id);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }
}
