package com.round13.backend.module.admin.mapper;

import com.round13.backend.domain.RoleEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.domain.UserStatus;
import com.round13.backend.module.admin.dto.CreateUserRequest;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", source = "role")
    @Mapping(target = "status", source = "request", qualifiedByName = "activeStatus")
    @Mapping(target = "passwordHash", source = "request", qualifiedByName = "encodePassword")
    UserEntity toEntity(CreateUserRequest request, RoleEntity role, @Context PasswordEncoder passwordEncoder);

    @Named("activeStatus")
    default UserStatus activeStatus(CreateUserRequest ignored) {
        return UserStatus.ACTIVE;
    }

    @Named("encodePassword")
    default String encodePassword(CreateUserRequest request, @Context PasswordEncoder encoder) {
        return encoder.encode(request.getPassword());
    }
}
