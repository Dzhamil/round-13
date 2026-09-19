# Coach roster and Sheets synchronization

The database is authoritative for club membership: `COACH` and business `ADMIN`, excluding
`DELETED`. `BLOCKED` and `PROFILE_INCOMPLETE` remain in the directory, as they did in the
application. Panel administrators in `admin_accounts` are separate authentication identities.
A sheet row alone never grants a business role or creates an account.

`GET /api/panel/users` retains all users and their original role/status, and exposes `coach`.
The admin table's “Тренеры” count/filter uses that membership flag. Business administrators
are labeled “Тренер · ADMIN”. The application uses the same role predicate in the actual
members query. The change does not introduce `/api/admin/users`.

## Findings on 2026-09-19

Read-only SQL on the deployed database found 97 users: 5 COACH, 3 ADMIN, and 89 ATHLETE.
All eight coach/admin accounts were ACTIVE. The public `/api/members?group=COACHES`
returned exactly these eight IDs. The deployed admin bundle renders all panel users and
labels roles literally; there is no pagination or filter dropping three rows. Counting only
COACH gives five, while the application's coach group also includes the three ADMIN users.

The active Schedule 2.0 space had no `credentials_env_var`. Its “Тренеры” tab was read
through the connected Google Drive account: six rows, one matching an app account by
normalized phone, five absent from the database, and seven database coaches absent from
Sheets. The existing sync only imported verification and schedule definitions; role/profile
changes never exported trainer identities. Its parser also missed the sheet's split-name
columns and “Ссылка на персональную вкладку” header.

The live `/api/panel/users` request returned 401 because no authenticated panel session
was provided. Its expected count (97 total / eight roster members) is inferred from SQL and
reviewed code, not claimed as a successful live API/browser observation. The current route
is covered locally with MockMvc, real H2 repository queries, and browser tests. The private
runtime handoff contains the full ID/name/phone comparison; production personal data is
not added to this repository.

## Export behavior

- Role mutations, manual coach creation, and coach profile updates persist identity hints
  in `coach_sheet_changes` in the same transaction as the user/profile change. Previous
  phones permit adoption of legacy rows even when identity changes before the first sync.
- A worker reconciles the complete roster every 60 seconds. `app.sheets.coaches-sync-delay-ms`
  configures its delay. The existing panel “sync” endpoint also runs roster reconciliation.
  Full reconciliation covers account deletion, missing events, and newly activated spaces.
- The worker locks the active space and reads a repeatable database snapshot. It consumes
  only the pending changes it read, and only after successful writes. Failures leave those
  hints for retry. A retry reads Sheets again and is idempotent even after a lost response.
- UUID in `Round13 ID` is the stable sheet identity. A legacy row without an ID can be adopted
  by a unique normalized current/previous phone. Conflicting IDs, duplicate legacy rows, or
  ambiguous reused phones abort the plan before any cell writes; resolve these explicitly.
- Current profile name parts (then legacy full name), nickname, phone, role and membership
  are updated with RAW cell writes. Missing display names fall back to nickname then phone.
  UUID still allows coaches without a phone to be exported.
- Existing personal-tab links and verification cells are preserved. An implicit legacy tab
  name is frozen when the row is adopted. New managed coaches without a schedule link do not
  trigger reads from an invented tab. Empty verification does not revoke staff verification.
- Revoked/deleted matched coaches are marked `Активен=Нет`; their rows and schedule links
  remain for history. Import skips inactive rows. Unmatched external rows are retained and
  are not imported as users or granted roles. Therefore the raw sheet row count can exceed
  the app roster count; compare active rows bound to `Round13 ID`.
- The gateway extends the trainer grid only as needed and never clears/replaces the sheet.
  Reordering trainer rows concurrently in Google Sheets during a sync is not supported;
  the database lock serializes backend workers, not human spreadsheet edits.

## Deployment/configuration

Apply V48 through normal Flyway startup and release backend before the matching frontend
(the frontend expects the new `coach` boolean). No production deployment was performed.
The configured active spreadsheet must contain the “Тренеры” tab with its identity headers.
Set `credentials_env_var` to the name of an environment variable holding a service-account
JSON and grant that account access. These production configuration changes were not made.
An absent space or blank credentials variable name disables export; missing/invalid runtime
credentials cause retries. Pending changes remain until synchronization succeeds.

No business production rows or Google Sheets cells were changed during diagnosis. The public
members GET is an existing endpoint that internally refreshes derived points/status cache;
no direct cache or business-data writes were issued by the executor.
