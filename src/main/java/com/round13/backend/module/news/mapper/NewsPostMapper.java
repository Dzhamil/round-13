package com.round13.backend.module.news.mapper;

import com.round13.backend.domain.NewsPostEntity;
import com.round13.backend.module.news.dto.AdminNewsPostResponse;
import com.round13.backend.module.news.dto.NewsPostResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Маппер новостей клуба.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NewsPostMapper {

    @Mapping(target = "excerpt", expression = "java(resolveExcerpt(entity))")
    NewsPostResponse toPublicResponse(NewsPostEntity entity);

    @Mapping(target = "excerpt", expression = "java(resolveExcerpt(entity))")
    AdminNewsPostResponse toAdminResponse(NewsPostEntity entity);

    List<NewsPostResponse> toPublicResponseList(List<NewsPostEntity> entities);

    List<AdminNewsPostResponse> toAdminResponseList(List<NewsPostEntity> entities);

    default String resolveExcerpt(NewsPostEntity entity) {
        String excerpt = trimToNull(entity.getExcerpt());
        if (excerpt != null) {
            return excerpt;
        }

        String content = trimToNull(entity.getContent());
        if (content == null) {
            return "";
        }

        String normalized = content.replace("\r", "").trim();
        int paragraphEnd = normalized.indexOf("\n\n");
        String firstParagraph = paragraphEnd >= 0 ? normalized.substring(0, paragraphEnd).trim() : normalized;
        if (firstParagraph.length() <= 220) {
            return firstParagraph;
        }
        return firstParagraph.substring(0, 217).trim() + "...";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
