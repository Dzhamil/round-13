package com.round13.backend.module.auth.mapper;

import com.round13.backend.domain.RefreshTokenEntity;
import com.round13.backend.domain.UserEntity;
import com.round13.backend.module.auth.service.TokenHashService;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.time.OffsetDateTime;

/**
 * Маппер refresh-токенов.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", source = "user")
    @Mapping(target = "tokenHash", source = "rawToken", qualifiedByName = "hashRefreshToken")
    @Mapping(target = "expiresAt", source = "expiresAt")
    @Mapping(target = "revoked", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    RefreshTokenEntity toEntity(UserEntity user, String rawToken, OffsetDateTime expiresAt, @Context TokenHashService tokenHashService);

    @Named("hashRefreshToken")
    default String hashRefreshToken(String rawToken, @Context TokenHashService tokenHashService) {
        return tokenHashService.hash(rawToken);
    }
}
