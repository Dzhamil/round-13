package com.round13.backend.module.verification.service;

import com.round13.backend.domain.*;
import com.round13.backend.module.members.repo.UserTrainerLinkRepository;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.profile.service.ProfileDisplayName;
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
        var trainers = userRepository.findAllWithRole().stream()
                .filter(user -> Set.of("COACH", "ADMIN").contains(user.getRole().getCode())).toList();
        var profiles = profiles(trainers.stream().map(UserEntity::getId).toList());
        return trainers.stream()
                .map(user -> new TrainerOption(user.getId(), displayName(user, profiles)))
                .toList();
    }

    @Transactional
    public List<RequestResponse> submit(UUID studentId, SubmitRequest request) {
        requireProfileReady(studentId);
        if (request.trainers().isEmpty()) return List.of();
        List<UUID> trainerIds = request.trainers().stream().map(Selection::trainerId).distinct().toList();
        Map<UUID, UserEntity> users = new HashMap<>();
        userRepository.findByIdInWithRole(trainerIds).forEach(u -> users.put(u.getId(), u));
        List<String> typesBySelection = new ArrayList<>();
        for (Selection selection : request.trainers()) {
            UserEntity trainer = users.get(selection.trainerId());
            if (trainer == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Тренер не найден");
            validateTrainer(trainer);
            typesBySelection.add(normalizeTypes(selection.trainingTypes()));
        }
        users.computeIfAbsent(studentId, this::requireUser);
        var profiles = profiles(List.copyOf(users.keySet()));
        Map<UUID, StudentVerificationRequestEntity> existing = new HashMap<>();
        requestRepository.findByStudentIdAndTrainerIdIn(studentId, trainerIds)
                .forEach(r -> existing.put(r.getTrainerId(), r));
        Map<UUID, StudentVerificationRequestEntity> pending = new LinkedHashMap<>();
        for (int i = 0; i < request.trainers().size(); i++) {
            Selection selection = request.trainers().get(i);
            UserEntity trainer = users.get(selection.trainerId());
            String types = typesBySelection.get(i);
            StudentVerificationRequestEntity entity = existing.computeIfAbsent(trainer.getId(), ignored -> new StudentVerificationRequestEntity());
            entity.setStudentId(studentId);
            entity.setTrainerId(trainer.getId());
            entity.setTrainingTypes(types);
            entity.setStatus(VerificationStatus.PENDING);
            entity.setDataConfirmed(false);
            entity.setRelationshipConfirmed(false);
            entity.setReviewedAt(null);
            entity.setReviewedByUserId(null);
            pending.put(trainer.getId(), entity);
        }
        requestRepository.saveAll(pending.values()).forEach(entity -> pending.put(entity.getTrainerId(), entity));
        // Previously the response profile queries auto-flushed inserts and populated createdAt.
        requestRepository.flush();
        List<RequestResponse> result = new ArrayList<>();
        for (int i = 0; i < request.trainers().size(); i++) {
            // Repeated selections share a row but retain their own normalized types in the response.
            result.add(toResponse(pending.get(request.trainers().get(i).trainerId()), users, profiles, typesBySelection.get(i)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> mine(UUID studentId) {
        return responses(requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @Transactional(readOnly = true)
    public List<RequestResponse> incoming(UUID trainerId) {
        requireTrainer(trainerId);
        return responses(requestRepository.findByTrainerIdAndStatusOrderByCreatedAtAsc(trainerId, VerificationStatus.PENDING));
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
        validateTrainer(trainer);
        return trainer;
    }

    private void validateTrainer(UserEntity trainer) {
        if (!Set.of("COACH", "ADMIN").contains(trainer.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Выбранный пользователь не является тренером");
        }
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

    private List<RequestResponse> responses(List<StudentVerificationRequestEntity> requests) {
        if (requests.isEmpty()) return List.of();
        Set<UUID> ids = new LinkedHashSet<>();
        requests.forEach(r -> { ids.add(r.getStudentId()); ids.add(r.getTrainerId()); });
        Map<UUID, UserEntity> users = new HashMap<>();
        userRepository.findAllById(ids).forEach(u -> users.put(u.getId(), u));
        var profiles = profiles(List.copyOf(ids));
        return requests.stream().map(r -> toResponse(r, users, profiles)).toList();
    }

    private RequestResponse toResponse(StudentVerificationRequestEntity entity, Map<UUID, UserEntity> users,
                                       Map<UUID, ProfileEntity> profiles) {
        return toResponse(entity, users, profiles, entity.getTrainingTypes());
    }

    private RequestResponse toResponse(StudentVerificationRequestEntity entity, Map<UUID, UserEntity> users,
                                       Map<UUID, ProfileEntity> profiles, String trainingTypes) {
        UserEntity student = Optional.ofNullable(users.get(entity.getStudentId())).orElseThrow();
        UserEntity trainer = Optional.ofNullable(users.get(entity.getTrainerId())).orElseThrow();
        return new RequestResponse(entity.getId(), entity.getStudentId(), displayName(student, profiles),
                entity.getTrainerId(), displayName(trainer, profiles), Set.of(trainingTypes.split(",")),
                entity.getStatus(), entity.isDataConfirmed(), entity.isRelationshipConfirmed(),
                entity.getCreatedAt(), entity.getReviewedAt());
    }

    private Map<UUID, ProfileEntity> profiles(List<UUID> ids) {
        Map<UUID, ProfileEntity> result = new HashMap<>();
        if (!ids.isEmpty()) profileRepository.findByUserIdIn(ids).forEach(p -> result.put(p.getUser().getId(), p));
        return result;
    }

    private String displayName(UserEntity user, Map<UUID, ProfileEntity> profiles) {
        return ProfileDisplayName.resolve(profiles.get(user.getId()), user.getNickname(),
                user.isPhoneHidden() ? null : user.getPhone());
    }

    private UserEntity requireUser(UUID id) { return userRepository.findById(id).orElseThrow(); }
    private String displayName(UserEntity user) {
        return ProfileDisplayName.resolve(
                profileRepository.findByUserId(user.getId()).orElse(null), user.getNickname(),
                user.isPhoneHidden() ? null : user.getPhone());
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }
}
