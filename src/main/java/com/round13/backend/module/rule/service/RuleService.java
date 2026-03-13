package com.round13.backend.module.rule.service;

import com.round13.backend.module.rule.dto.RuleResponse;
import com.round13.backend.module.rule.mapper.RuleMapper;
import com.round13.backend.module.rule.repo.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Сервис чтения правил клуба.
 */
@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;
    private final RuleMapper ruleMapper;

    /**
     * Возвращает правила клуба в порядке отображения.
     */
    @Transactional(readOnly = true)
    public List<RuleResponse> getRules() {
        return ruleMapper.toResponseList(ruleRepository.findAllByOrderBySortOrderAsc());
    }
}
