# Trainer Sheets and Schedule 2.0 synchronization

Panel administrators open `/admin/google-sheets` (Google Sheets · Schedule 2.0), select the intended active space and click **Синхронизировать таблицу**. The first intended spreadsheet is `1p63WUT0LfF0lWgqD9LruS77aPAUUZcBLOGfWzQZsTjM`; it is configured through existing space settings, not hardcoded. The response links to the spreadsheet actually updated.

`POST /api/panel/google-sheet-spaces/active/sync-trainers` is protected by the existing PANEL_ADMIN security chain. It exports only trainer identity; it does not invoke the older `/active/sync` import endpoint.

## Contract

The source of truth is `users.trainer = true`, excluding deleted/permanently deleted users. ADMIN alone does not imply trainer identity. Blocked users retain their trainer identity until it is explicitly revoked, consistent with the members coaches list.

The `Тренеры` tab has these columns (recognized existing aliases are reused):

| Column | Ownership |
| --- | --- |
| user_id | Application UUID; sole identity key |
| ФИО | Profile surname + first name + patronymic; legacy full name/nickname fallback |
| Ник | Current users.nickname |
| Телефон | Current users.phone, written as RAW text |
| Активен | Да only for the first matching row of a current DB trainer; otherwise Нет |
| Личный лист | Existing personal sheet reference preserved; blank for new rows |
| sync_status | Синхронизирован / Неактивен в БД / Нет пользователя БД / Дубликат user_id |
| synced_at | UTC timestamp of the successful request's snapshot |

Existing row positions, unknown columns and personal-sheet references are preserved. Existing name, phone, activity and personal-sheet aliases are supported. Ambiguous headers fail explicitly before values are written. The integration reads columns A:ZZ; wider layouts require a separate migration.

Rows without a valid matching UUID, including fake trainers and historical rows without IDs, become inactive. They are never matched to a DB user by nickname, name or phone. A real trainer with no UUID-linked row gets a new row, even if their name matches an inactive historical row. Existing duplicate UUID rows remain physically present but only the first can be active. New synchronizations do not create more duplicates. The existing trainer reader ignores explicitly inactive rows so these rows are not treated as working trainers; participant parsing is unchanged.

A space row lock serializes export requests across application instances. Managed cells are written in one RAW batch; the export never calls clear/replace/delete/append. If the network fails after Google accepted a request, retry reconciles the existing UUIDs. Direct concurrent human edits in Sheets are not locked: edit trainer identity in the application and use the mirror as an export.

The trainer mirror endpoint does not run the schedule import or its scheduler. An absent summary tab can be created. Personal tabs and historical rows are never deleted. Existing attendance behavior is unchanged.

## Acceptance check after deployment

1. Configure service-account credentials and editor access using the existing space settings; activate the intended spreadsheet.
2. Count users where trainer=true and permanently_deleted=false and status<>'DELETED'.
3. Click the sync button and compare the active count. Check user_id, profile/contact values, and inactive historical/fake rows. The UI reports active, added, inactive, unmatched and duplicate counts.
4. Click again: added=0, same active UUIDs and physical row count; only synced_at changes.
5. Grant trainer through the panel, sync, and verify a new/reenabled UUID row. Revoke trainer, sync, and verify the same row has Активен=Нет and its personal-tab reference remains. ADMIN rights are independent.
6. Change profile/contact data, sync, and verify the same UUID row updates.

Automated tests use mocked Google transport and browser API, plus a real Hibernate/H2 query test. They do not prove live service-account permissions or live sheet contents. No live DB/Sheet mutation is part of the code delivery; run the acceptance check after the orchestrator merges/deploys it.


## Import personal trainer tabs into Schedule 2.0

Primary implementation owner for this import is `TrainerSheetImportService`; reconciliation lives in
`TrainerSheetPersistenceService`, identity matching in `TrainerSheetUserResolver`, and validation/mapping
in `TrainerSheetImportPlan`. Parsers remain read-only. Migration `V51__trainer_sheet_schedule2_import.sql`
adds source ownership and a database uniqueness constraint; it does not modify existing schedule ownership.

`POST /api/panel/google-sheet-spaces/active/sync` and `TrainerSheetImportScheduler` both call
`GoogleSheetSyncService.syncActive()`. The scheduler runs at minutes 00 and 30 of every hour (Europe/Moscow).
The older user-verification synchronization remains part of this common entry point. The separate
`/active/sync-trainers` endpoint above still exports trainer identities and is not the import trigger.

### Input and identity

- Only active rows from `Тренеры` are processed. The personal-sheet reference accepts a tab title or the
  existing same-spreadsheet URL/gid format; gid resolution handles renamed tabs.
- The `Синхронизация` label above the training catalogue owns the flag cell immediately to its right
  (the current template uses B2/C2). TRUE/Да/Yes/1 enables import. FALSE/Нет/No/0, blank or missing control
  skips the entire tab, preserving all its existing DB records. Unknown or duplicate flags are errors.
  Disabled tabs are not parsed or reconciled, so an unfinished edit does not clear the schedule.
- Trainer matching uses `user_id` when supplied, otherwise a unique normalized phone. An invalid or
  unknown UUID never falls back to a different user. The DB user must be a nondeleted trainer.
- Students match exact normalized profile ФИО or nickname, ignoring case, repeated spaces and ё/е.
  There is no fuzzy matching. Unknown or ambiguous names and duplicate student identities fail the entire
  tab with training ID and physical source-row diagnostics. Active user identities load in one batch;
  profiles load in chunks of at most 500, with no per-student lookups.
- PERSONAL/Персональная maps to PERSONAL; GROUP/Групповая, Сплит and Мини-группа map to GROUP;
  OPEN/Открытая maps to OPEN. The current DB enum has no separate split/mini-group values.
- Each configured date header creates a session even when the detail table has no students. Explicit
  local times are preserved in Europe/Moscow. A date-only header uses **00:00 Europe/Moscow** as the
  documented placeholder required by the existing non-null `start_time`; the source model keeps its
  absent time. No actual start time is inferred from a training title.

### Reconciliation and transaction boundary

Each trainer import has its own `REQUIRES_NEW` transaction. It locks the active Google Sheet space row
before reading the personal tab and holds the lock through DB application. This serializes overlapping
manual/scheduled runs across application instances, including the source read; a uniqueness constraint
provides an additional DB guard. A failed tab rolls back without preventing later trainers from committing.

The stable session key is `(spreadsheet_id, coach_user_id, sheet-local training_id, local date/time)`.
Renaming a training or tab and changing duration updates the same session UUID. Moving a date retires the
old key and creates the new one. Every imported session has `schedule2_enabled=true`. Participants are
keyed by session/user and saved with `saveAll`; unchanged repeat imports retain session and participation
UUIDs. Attendance true becomes PRESENT, false/blank becomes ABSENT. A changed attendance value increments
`attendance_version` so a previously loaded app form detects the change.

A missing imported session is marked `sheet_import_active=false`, hidden from Schedule 2.0 list/detail,
and can be restored with the same UUID if it returns. Missing sync-created participants are physically
removed, including those under a retired session. App-created sessions and app-created participants are
never deleted by this reconciliation. An inactive trainer row or disabled flag does not retire anything.
Switching to another spreadsheet leaves records belonging to the old spreadsheet untouched.

The enabled sheet is authoritative for imported attendance on each run: later imports can replace app
attendance with the current sheet value. This task adds no attendance writeback to personal tabs. Existing
application writeback behavior is unchanged.

`Оплатил` remains in the parsed model only. The DB has no suitable payment boolean: `charged_at` means
an entitlement/session debit, not payment of this sheet date. Payment persistence requires a separate
model/migration and is not silently mapped to `charged_at`.

### Results and verification

The existing sync response fields are retained, with `imports` added: one result per trainer with status
`IMPORTED`, `SKIPPED_SYNC_DISABLED` or `ERROR`, trainer/tab reference, error text, and applied/retired/removed
counts. `trainerSheets` contains successfully imported snapshots; the explicit `readTrainerSheets()` API
remains read-only and ignores the import flag. Scheduler logs include tab/trainer failure context; outer
failures are caught so subsequent scheduled invocations continue.

`TrainerSheetImportIntegrationTest` verifies Hibernate persistence, existing Schedule 2.0 HTTP list/detail,
repeat/update behavior, blank/false attendance, disabled flags, retirement/restoration, empty student tables,
per-trainer failure isolation, late transactional rollback, concurrent calls and bounded identity queries.
`TrainerSheetImportSchedulerTest` checks common entry-point use, the 30-minute schedule and error recovery.
`TrainerSheetSyncFlagTest` covers enabled/disabled/missing/ambiguous controls. Live Google Sheets and production
DB changes are excluded from implementation validation; integration and deployment belong to the orchestrator/owner.
