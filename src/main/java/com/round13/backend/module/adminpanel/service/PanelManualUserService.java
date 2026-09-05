package com.round13.backend.module.adminpanel.service;

import com.round13.backend.domain.*;
import com.round13.backend.exception.*;
import com.round13.backend.module.adminpanel.controller.dto.*;
import com.round13.backend.module.profile.repo.ProfileRepository;
import com.round13.backend.module.user.repo.*;
import com.round13.backend.shared.phone.RussianPhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service @RequiredArgsConstructor
public class PanelManualUserService {
    private static final String ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private final UserRepository users; private final RoleRepository roles; private final ProfileRepository profiles;
    private final PasswordEncoder encoder; private final RussianPhoneNormalizer normalizer;
    private final SecureRandom random = new SecureRandom();
    @Transactional public PanelCreateUserResponse create(PanelCreateUserRequest request) {
        String phone=normalizer.normalize(request.phone()).orElseThrow(()->new BusinessException(ErrorCode.INVALID_REQUEST));
        if(users.existsByPhone(phone)) throw new BusinessException(ErrorCode.PHONE_EXISTS);
        String nickname=trim(request.telegramNickname());
        if(nickname!=null && users.existsByNickname(nickname)) throw new BusinessException(ErrorCode.NICKNAME_EXISTS);
        String password=request.generatePassword()?generate():request.password();
        if(password==null || password.length()<8) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        UserEntity user=new UserEntity(); user.setPhone(phone); user.setNickname(nickname); user.setPasswordHash(encoder.encode(password));
        user.setRole(roles.findByCode(request.roleCode()).orElseThrow(()->new BusinessException(ErrorCode.ROLE_NOT_FOUND)));
        user.setStatus(UserStatus.ACTIVE); user=users.save(user);
        ProfileEntity profile=new ProfileEntity(); profile.setUser(user); profile.setSurname(request.surname().trim());
        profile.setFirstName(request.firstName().trim()); profile.setPatronymic(trim(request.patronymic()));
        profile.setFullName(String.join(" ", java.util.stream.Stream.of(profile.getSurname(),profile.getFirstName(),profile.getPatronymic()).filter(java.util.Objects::nonNull).toList()));
        profile.setProfileCompleted(false); profiles.save(profile);
        return new PanelCreateUserResponse(user.getId(),password);
    }
    private String generate(){StringBuilder b=new StringBuilder(14);for(int i=0;i<14;i++)b.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));return b.toString();}
    private String trim(String v){return v==null||v.isBlank()?null:v.trim();}
}
