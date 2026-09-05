package com.round13.backend.module.sheets.controller;

import com.round13.backend.module.sheets.dto.GoogleSheetDtos.*;
import com.round13.backend.module.sheets.service.GoogleSheetSpaceService;
import com.round13.backend.module.sheets.service.GoogleSheetSyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/panel/google-sheet-spaces") @RequiredArgsConstructor
public class PanelGoogleSheetController {
    private final GoogleSheetSpaceService service;
    private final GoogleSheetSyncService syncService;
    @GetMapping public List<SpaceResponse> list(){return service.list();}
    @PostMapping public SpaceResponse create(@Valid @RequestBody SpaceRequest r){return service.create(r);}
    @PutMapping("/{id}") public SpaceResponse update(@PathVariable UUID id,@Valid @RequestBody SpaceRequest r){return service.update(id,r);}
    @PostMapping("/{id}/activate") public SpaceResponse activate(@PathVariable UUID id){return service.activate(id);}
    @PostMapping("/{id}/test") public AccessTestResponse test(@PathVariable UUID id){return service.test(id);}
    @PostMapping("/active/sync") public SyncResponse sync(){return syncService.syncActive();}
}
