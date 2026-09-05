package com.round13.backend.module.sheets.service;

import com.round13.backend.domain.GoogleSheetSpaceEntity;
import com.round13.backend.module.sheets.dto.GoogleSheetDtos.*;
import com.round13.backend.module.sheets.repo.GoogleSheetSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class GoogleSheetSpaceService {
    private final GoogleSheetSpaceRepository repository;
    private final GoogleSheetsGateway gateway;
    @Transactional(readOnly=true) public List<SpaceResponse> list() { return repository.findAllByOrderByCreatedAtDesc().stream().map(this::response).toList(); }
    @Transactional public SpaceResponse create(SpaceRequest request) { return save(new GoogleSheetSpaceEntity(), request); }
    @Transactional public SpaceResponse update(UUID id, SpaceRequest request) { return save(require(id), request); }
    @Transactional public SpaceResponse activate(UUID id) { repository.deactivateAll(); GoogleSheetSpaceEntity value=require(id); value.setActive(true); return response(repository.save(value)); }
    @Transactional(readOnly=true) public AccessTestResponse test(UUID id) { gateway.testReadWrite(require(id)); return new AccessTestResponse(true, "Чтение и запись доступны"); }
    private SpaceResponse save(GoogleSheetSpaceEntity value, SpaceRequest request) {
        validateId(request.spreadsheetUrl(), request.spreadsheetId());
        if (request.active()) repository.deactivateAll();
        value.setDisplayName(request.displayName().trim()); value.setSpreadsheetUrl(request.spreadsheetUrl().trim());
        value.setSpreadsheetId(request.spreadsheetId().trim()); value.setServiceAccountEmail(trim(request.serviceAccountEmail()));
        value.setCredentialsEnvVar(trim(request.credentialsEnvVar())); value.setAccessDetails(trim(request.accessDetails())); value.setActive(request.active());
        return response(repository.save(value));
    }
    private void validateId(String url, String id) { if (!url.contains("/spreadsheets/d/" + id)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL и spreadsheet id не совпадают"); }
    private GoogleSheetSpaceEntity require(UUID id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sheet-пространство не найдено")); }
    private SpaceResponse response(GoogleSheetSpaceEntity s) { return new SpaceResponse(s.getId(),s.getDisplayName(),s.getSpreadsheetUrl(),s.getSpreadsheetId(),s.getServiceAccountEmail(),s.getCredentialsEnvVar(),s.getAccessDetails(),s.isActive(),s.getCredentialsEnvVar()!=null && System.getenv(s.getCredentialsEnvVar())!=null); }
    private String trim(String v) { return v==null||v.isBlank()?null:v.trim(); }
}
