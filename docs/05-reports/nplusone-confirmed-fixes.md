# Confirmed DB N+1 fixes

Task: `TASK-20260921T082142Z-nplusone-sequential-audit-then-fix-525a8825`, Stage 2.
Source: accepted Stage 1 `TASK-20260921T082142Z-nplusone-audit-report.md` (2026-09-21).

## Change-to-finding map

Paths below are relative to `src/main/java/com/round13/backend/module`.

| Finding | Production files | Change |
| --- | --- | --- |
| NPLUSONE-001 | `schedule2/service/Schedule2Service.java` | Load distinct students once; validate the entire set before persistence; preserve input order and participant defaults; save participants as a collection. |
| NPLUSONE-002 | `schedule2/service/Schedule2Service.java` | Use existing grouped participant counts and one profile batch for a list; absent counts default to zero. |
| NPLUSONE-003 | `schedule2/service/Schedule2Service.java` | Load participant and coach profiles together; pure response mapping, including create/attendance responses. Detail count uses its already loaded participants. |
| NPLUSONE-004 | `sheets/service/AttendanceSheetSyncService.java` | One distinct profile batch, one coach-name resolution, existing row order and single append retained. |
| NPLUSONE-005 | `sheets/service/GoogleSheetSyncService.java`, `user/repo/UserRepository.java` | Normalize first, fetch unique phones in chunks of 500, preserve first encountered person's flag and per-input-row missing counts, reject duplicate DB phone matches, save changed users together. |
| NPLUSONE-006 | `verification/service/StudentVerificationService.java` | Batch user/profile reads for lists and trainer options; preserve ordering, missing-profile fallback and phone privacy. Single-request review is unchanged. |
| NPLUSONE-007 | `verification/service/StudentVerificationService.java`, `verification/repo/StudentVerificationRequestRepository.java`, `user/repo/UserRepository.java` | Batch trainer validation/existing requests/names; validate in selection order before writes; save unique rows together and flush once to populate response timestamps. Repeated selections return separate type snapshots sharing one request ID, and the last selection remains persisted. |
| NPLUSONE-008 | `shop/service/OrderListData.java`, `ShopOrderService.java`, `AdminShopOrderService.java`, `shop/repo/ShopOrderItemRepository.java`, `ShopOrderTrainingRequestRepository.java` | Load items and requests by order IDs, group in memory for user/pending/processed histories. Preserve order-list order, summed quantities, and the user/admin difference for empty orders. |
| NPLUSONE-009 | `info/service/ClubEventService.java` | Resolve the current user's remaining group trainings once per list if any qualifying event exists. Anonymous and ordinary-only lists skip it. |
| NPLUSONE-010 | `members/service/MembersService.java`, `MemberPointsCacheService.java`, `MemberDetailsService.java` | Reuse profiles for names and immediate recalculation, apply refreshed points/status to existing list rows without a second list query. Recalculate the loaded detail bundle in one transaction. Daily scheduling, immediate freshness, missing-stats creation and existing list sorting are retained. |

## Focused tests

Paths relative to `src/test/java/com/round13/backend/module`:

- 001–003: `schedule2/service/Schedule2ServiceTest.java`; 1/10/100 rows, count defaults, ordered DTOs, versions, duplicate IDs, missing final user, empty input, missing/partial/legacy names.
- 001–003, 007: `schedule2/service/ConfirmedBatchIntegrationTest.java`; cold H2 persistence contexts and Hibernate statement counts, creation/attendance rollback, persisted duplicate verification selections and timestamps.
- 004–005: `sheets/service/SheetsBatchReadsTest.java`, `GoogleSheetSyncServiceTest.java`; configured/empty export, 100 ordered attendance rows, distinct profile reads, 500-phone chunk boundary, conflicting duplicate flags, missing/invalid/unchanged people, duplicate database phones; gateways are mocks.
- 006–007: `verification/service/VerificationBatchTest.java`; 1/10/100-row list and submission budgets, privacy, eligibility, empty lists, resubmission resets, duplicate snapshots, and invalid late selections causing no writes.
- 008: `shop/service/OrderListsBatchTest.java`; 0/1/10/100 orders across all three histories, empty-order semantics, shared product, quantities, first returned request and query budgets.
- 009: `info/service/ClubEventBatchTest.java`; all three lists, 100 mixed events, shared balance, anonymous/no qualifying events.
- 010: `members/service/MemberRefreshBatchTest.java`; all list flows and repeated reads, shared profile/query budgets, missing stats, and immediate stats/role/debut-date changes in a reused detail bundle. Existing `MembersProfileNamesTest` covers hidden-phone fallback.

## Deliberate limits

- NPLUSONE-011–016 remain unmodified: they need separate validation. No global fetch policy, JDBC batch settings, entitlement activation, catalog, or profile export architecture changes.
- NPLUSONE-017 remains unmodified: Sheets/OAuth API fan-out belongs to the separate Sheets integration refactor. Only DB enrichment/import changes are made here; integrating that branch requires reviewing overlapping Sheets service files.
- Collection saves do not mean one SQL statement or verified JDBC DML batching. Necessary inserts/updates and assigned-ID stats merges remain; this change fixes confirmed repeated reads, not the unvalidated write-batching finding 015.
- Order item and training-request queries previously had no `ORDER BY`. Grouping retains first returned row semantics without inventing a new sort; which row a database returns first remains unspecified. Order-list sorting itself is unchanged.
- Member reads still calculate and persist fresh cache values. This intentionally preserves immediate freshness; it removes redundant reads, not all O(N) calculation/write work.
- Phone parameters are chunked. Other bulk queries follow the existing list-based repository style; very large unpaginated datasets can still need a separately scoped pagination/parameter-limit change.
- H2 and repository-call budgets are not production PostgreSQL profiling. Unvalidated lazy association loading (especially order products/buyers/categories, 013) can still add SQL.

No frontend changes; no npm build. No PR, merge or deployment.

## Verification result

- Focused service tests passed with `./mvnw -q -DskipTests=false '-Dtest=Schedule2ServiceTest,*BatchTest,SheetsBatchReadsTest,GoogleSheetSyncServiceTest,AttendanceSheetSyncServiceTest,MembersProfileNamesTest,StudentVerificationServiceTest' test`.
- Integration and verification submission tests passed with `./mvnw -q -DskipTests=false '-Dtest=ConfirmedBatchIntegrationTest,VerificationBatchTest' test`.
- Final full backend suite: `./mvnw -q -DskipTests=false test` — **228 tests, 0 failures, 0 errors, 0 skipped**.
- Cold schedule list and detail each execute exactly **3 prepared SELECT statements** for 1, 10 and 100 rows.
- `git diff --check` passed.
