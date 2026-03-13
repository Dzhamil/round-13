package com.round13.backend.module.members.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Ответ со списком участников.
 */
@Schema(description = "Список участников клуба")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembersListResponse {

    @Schema(description = "Элементы списка")
    private List<MemberListItemResponse> items;
}
