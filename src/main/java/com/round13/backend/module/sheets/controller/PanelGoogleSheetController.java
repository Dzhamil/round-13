package com.round13.backend.module.sheets.controller;

import com.round13.backend.module.sheets.dto.GoogleSheetDtos.*;
import com.round13.backend.module.sheets.service.GoogleSheetSpaceService;
import com.round13.backend.module.sheets.service.GoogleSheetSyncService;
import com.round13.backend.module.sheets.service.TrainerSheetSyncService;
import com.round13.backend.module.sheets.service.ParticipantSheetSyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/panel/google-sheet-spaces") @RequiredArgsConstructor
public class PanelGoogleSheetController {
    private final com.round13.backend.module.sheets.service.AllUsersSheetSyncService allUsersSyncService;

    @PostMapping("/active/sync-users")
    public com.round13.backend.module.sheets.service.AllUsersSheetSyncService.Response syncUsers() {
        return allUsersSyncService.syncActive();
    }
    private final GoogleSheetSpaceService service;
    private final GoogleSheetSyncService syncService;
    private final TrainerSheetSyncService trainerSyncService;
    private final ParticipantSheetSyncService participantSyncService;

    @PostMapping("/active/sync-participants")
    public ParticipantSheetSyncService.Response syncParticipants() {
        return participantSyncService.syncActive();
    }
    @PostMapping("/active/sync-trainers")
    public TrainerSheetSyncService.Response syncTrainers() {
        return trainerSyncService.syncActive();
    }
    @GetMapping public List<SpaceResponse> list(){return service.list();}
    @PostMapping public SpaceResponse create(@Valid @RequestBody SpaceRequest r){return service.create(r);}
    @PutMapping("/{id}") public SpaceResponse update(@PathVariable UUID id,@Valid @RequestBody SpaceRequest r){return service.update(id,r);}
    @PostMapping("/{id}/activate") public SpaceResponse activate(@PathVariable UUID id){return service.activate(id);}
    @PostMapping("/{id}/test") public AccessTestResponse test(@PathVariable UUID id){return service.test(id);}
    @PostMapping("/active/sync") public SyncResponse sync(){return syncService.syncActive();}
}
