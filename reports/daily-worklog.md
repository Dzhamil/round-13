# Work log

## 2026-09-22 — agent-coder — Trainer Sheets Schedule 2.0 import

- Task: `TASK-20260922T172851566Z-admin-round13-9d99cffa`, including the unchanged Owner amendment.
- Recipient: `orchestrator-round13`; integration, acceptance and production deployment remain external to this implementation pass.
- Branch: `feature/trainer-sheet-schedule2-import`; base `origin/dev c7d3725`, containing dependency `d4a5a70` through PR #94.
- Primary maintained contract: [trainer-sheet-sync.md](../docs/trainer-sheet-sync.md). It owns identity rules,
  transaction boundaries, reconciliation strategy, date/type mapping, payment limitation and operational entry points.

### Delivered

Separate read-only parsing, batch user resolution, validated import plan and transactional persistence;
source keys/uniqueness migration V51; Schedule 2.0 visibility; per-trainer rollback and error results;
sync-flag gating; common manual/scheduled service with a 30-minute scheduler. The model now retains
physical source rows and date headers even when a training has no students.

Missing sync sessions become inactive and can regain their UUID; missing sync-created participants are
removed. App-created rows are not deleted. Disabled/inactive trainer sources leave the existing schedule
untouched. Enabled Sheets attendance is authoritative on each import and can overwrite app attendance;
this scope adds no personal-tab attendance writeback.

Payment is read but not persisted: no suitable existing payment field exists, and `charged_at` has different
semantics. The separate model/migration follow-up is tracked in [backlog.md](../planning/backlog.md).
Date-only headers use a documented 00:00 Europe/Moscow placeholder. This is an implementation assumption,
not an owner-confirmed real training time; the clarification sent during implementation had no response.
Split and mini-group use the existing GROUP enum; personal uses PERSONAL, open uses OPEN.

### Verification

- `JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn test -DskipTests=false -q`: **383 tests, 0 failures, 0 errors, 0 skipped**.
- `TrainerSheetImportIntegrationTest`: **11 passing cases**, including real Hibernate persistence,
  Schedule 2.0 list/detail HTTP responses, attendance mapping, repeated/changed import, disabled flags,
  retirement/restoration, manual-session preservation, empty student tables, partial trainer failure,
  post-persistence rollback and overlapping imports.
- Identity query checks with 1 and 100 extra students: **5 queries and 0 entity fetches** in both cases;
  participant persistence uses `saveAll`, no `save` in an import loop.
- `TrainerSheetImportSchedulerTest`: same service as manual sync, half-hour cron and recovery after failure.
- `TrainerSheetSyncFlagTest`: true/false/empty/missing/malformed/duplicate controls.
- All **51 migrations**, including final V51, applied to an isolated clean **PostgreSQL 16.15** database.
  Additional SQL checks proved duplicate source rejection, incomplete source rejection and legacy-row acceptance.
- `git diff --check`: PASS. No frontend changes; no live Google Sheets/production DB/deploy validation or mutation.
- Initial Maven attempt used the machine's Maven-default JDK 25 and failed in Lombok initialization;
  validation used the repository-required JDK 21. Intermediate test-harness compilation/stubbing issues were fixed.

### Runtime continuity

Onboarding/binding `agent-coder`, external authority/runtime `admin-round13` match, directives and the assigned
exclusive lock were checked. Prior manual-review publications remain deferred; the unrelated Apps Script
skill remains pending-user. The contract was published as
`PUB-DOC-20260922T174115276941Z-agent-coder-ea5257a9` with base/result/payload hashes.
Canonical task/actor/lock/handoff records under `/srv/round13-runtime` carry the live handoff state.
