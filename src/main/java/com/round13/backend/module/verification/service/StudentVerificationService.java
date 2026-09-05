package com.round13.backend.module.verification.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.UserRepository;
import com.round13.backend.module.verification.dto.VerificationDtos.*;
import com.round13.backend.module.verification.repo.StudentVerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentVerificationService {
    private static final Set<String> ALLOWED_TYPES = Set.of("GROUP", "PERSONAL", "SPLIT", "MINI_GROUP");
    private final StudentVerificationRequestRepository requestRepository;
    private final UserTrainerLinkRepository linkRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<TrainerOption> trainers() {
        return userRepository.findAllWithRole().stream()
                .filter(user -> Set.of("COACH", "ADMIN").contains(user.getRole().getCode()))
                .map(user -> new TrainerOption(user.getId(), displayName(user)))
                .toList();
    }

    @Transactional
    public List<RequestResponse> submit(UUID studentId, SubmitRequest request) {
        requireProfileReady(studentId);
        List<RequestResponse> result = new ArrayList<>();
        for (Selection selection : request.trainers()) {
            UserEntity trainer = requireTrainer(selection.trainerId());
            String types = normalizeTypes(selection.trainingTypes());
            StudentVerificationRequestEntity entity = requestRepository
                    .findByStudentIdAndTrainerId(studentId, trainer.getId())
                    .orElseGet(StudentVerificationRequestEntity::new);
            entity.setStudentId(studentId);
            entity.setTrainerId(trainer.getId());
            entity.setTrainingTypes(types);
            entity.setStatus(VerificationStatus.PENDING);
            entity.setDataConfirmed(false);
            entity.setRelationshipConfirmed(false);
            entity.setReviewedAt(null);
            entity.setReviewedByUserId(null);
            result.add(toResponse(requestRepository.save(entity)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> mine(UUID studentId) {
        return requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> incoming(UUID trainerId) {
        requireTrainer(trainerId);
        return requestRepository.findByTrainerIdAndStatusOrderByCreatedAtAsc(trainerId, VerificationStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public RequestResponse review(UUID trainerId, UUID requestId, ReviewRequest review) {
        StudentVerificationRequestEntity entity = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Заявка не найдена"));
        if (!entity.getTrainerId().equals(trainerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Можно проверять только собственные заявки");
        }
        if (entity.getStatus() != VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Заявка уже обработана");
        }
        entity.setDataConfirmed(review.dataConfirmed());
        entity.setRelationshipConfirmed(review.relationshipConfirmed());
        entity.setStatus(review.dataConfirmed() && review.relationshipConfirmed()
                ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        entity.setReviewedAt(OffsetDateTime.now());
        entity.setReviewedByUserId(trainerId);
        if (entity.getStatus() == VerificationStatus.APPROVED) {
            UserTrainerLinkEntity link = linkRepository.findByTrainerIdAndStudentId(trainerId, entity.getStudentId())
                    .orElseGet(UserTrainerLinkEntity::new);
            link.setTrainerId(trainerId);
            link.setStudentId(entity.getStudentId());
            link.setTrainingTypes(entity.getTrainingTypes());
            linkRepository.save(link);
            UserEntity student = userRepository.findById(entity.getStudentId()).orElseThrow();
            student.setPhoneVerifiedByStaff(true);
        }
        return toResponse(entity);
    }

    private void requireProfileReady(UUID studentId) {
        ProfileEntity profile = profileRepository.findByUserId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Сначала заполните профиль"));
        if (blank(profile.getSurname()) || blank(profile.getFirstName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Укажите имя и фамилию");
        }
    }

    private UserEntity requireTrainer(UUID trainerId) {
        UserEntity trainer = userRepository.findByIdWithRole(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренер не найден"));
        if (!Set.of("COACH", "ADMIN").contains(trainer.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Выбранный пользователь не является тренером");
        }
        return trainer;
    }

    private String normalizeTypes(Set<String> values) {
        Set<String> normalized = values.stream().map(String::trim).map(String::toUpperCase)
                .collect(Collectors.toCollection(TreeSet::new));
        if (normalized.isEmpty() || !ALLOWED_TYPES.containsAll(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недопустимый тип тренировки");
        }
        return String.join(",", normalized);
    }

    private RequestResponse toResponse(StudentVerificationRequestEntity entity) {
        return new RequestResponse(entity.getId(), entity.getStudentId(), displayName(requireUser(entity.getStudentId())),
                entity.getTrainerId(), displayName(requireUser(entity.getTrainerId())),
                Set.of(entity.getTrainingTypes().split(",")), entity.getStatus(), entity.isDataConfirmed(),
                entity.isRelationshipConfirmed(), entity.getCreatedAt(), entity.getReviewedAt());
    }

    private UserEntity requireUser(UUID id) { return userRepository.findById(id).orElseThrow(); }
    private String displayName(UserEntity user) {
        return profileRepository.findByUserId(user.getId()).map(profile -> {
            String value = String.join(" ", Arrays.asList(profile.getSurname(), profile.getFirstName(), profile.getPatronymic())
                    .stream().filter(Objects::nonNull).filter(v -> !v.isBlank()).toList());
            return value.isBlank() ? (profile.getFullName() == null ? user.getPhone() : profile.getFullName()) : value;
        }).orElse(user.getPhone());
    }
    private boolean blank(String value) { return value == null || value.isBlank(); }
}
