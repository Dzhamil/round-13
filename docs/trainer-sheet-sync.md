# Manual trainer mirror for Schedule 2.0

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

No scheduler, schedule/attendance import, personal-tab provisioning or deletion is added. An absent summary tab can be created. Personal tabs and historical rows are never deleted. Existing attendance behavior is unchanged.

## Acceptance check after deployment

1. Configure service-account credentials and editor access using the existing space settings; activate the intended spreadsheet.
2. Count users where trainer=true and permanently_deleted=false and status<>'DELETED'.
3. Click the sync button and compare the active count. Check user_id, profile/contact values, and inactive historical/fake rows. The UI reports active, added, inactive, unmatched and duplicate counts.
4. Click again: added=0, same active UUIDs and physical row count; only synced_at changes.
5. Grant trainer through the panel, sync, and verify a new/reenabled UUID row. Revoke trainer, sync, and verify the same row has Активен=Нет and its personal-tab reference remains. ADMIN rights are independent.
6. Change profile/contact data, sync, and verify the same UUID row updates.

Automated tests use mocked Google transport and browser API, plus a real Hibernate/H2 query test. They do not prove live service-account permissions or live sheet contents. No live DB/Sheet mutation is part of the code delivery; run the acceptance check after the orchestrator merges/deploys it.

## All users mirror

`/admin/google-sheets` has a separate **Синхронизировать всех пользователей** action:
`POST /api/panel/google-sheet-spaces/active/sync-users` (PANEL_ADMIN). It uses the active
space and the same pessimistic space lock as the other manual exports.

The source is exactly `PanelUsersService.getUsers()`'s `UserRepository.findAllWithRole()`:
`users JOIN roles ON roles.id=users.role_id WHERE users.permanently_deleted=false`.
BLOCKED, PROFILE_INCOMPLETE and soft DELETED users remain included, just as in
`GET /api/panel/users`. Permanently deleted users are excluded. No legacy endpoint is used.

The application owns the entire `Все пользователи` tab (A:ZZ). It writes a deterministic
UUID-sorted snapshot keyed by `user_id`, one row per UUID. All old rows/columns within
that range are overwritten or blanked in the same RAW values batch, including fake rows,
duplicates and users absent from the current admin source. Thus removed users are **removed
from this export**, not retained with ambiguous stale personal data. This intentionally differs
from the history-preserving trainer mirror. Do not keep manual notes/formulas on this tab.
Layouts wider than ZZ are unsupported. Other tabs and schedules are untouched.
The grid is expanded as needed, the first row frozen, headers bold/wrapped, columns sized,
and a basic filter applied. Formatting precedes the single values batch; a failure is visible
and retry re-reads/rebuilds the snapshot. Direct concurrent human edits are not locked.

Columns, in order:
`№`, `user_id`, `Фамилия`, `Имя`, `Отчество`, `Отображаемое имя`, `Ник`, `Телефон`,
`Роль`, `Тренер`, `Админ`, `Статус`, `Профиль заполнен / верификация профиля`,
`Telegram user id`, `Личный тренер / связанные тренеры`, `sync_status`, `synced_at`.

Structured FIO comes only from profile surname/first_name/patronymic, including blanks.
Display name uses structured FIO, legacy full_name, nickname, phone, then `Без имени`.
Phone is available to panel administrators (same visibility as the admin list); phone and
Telegram ID are written as RAW strings. Role is the role code; trainer is only users.trainer;
admin is only role ADMIN. ADMIN never implies trainer. Status is the unmodified enum code.
Profile completion is recomputed with `ProfileServiceUtil.isCompleted`, not trusted from a
possibly stale stored flag: `Заполнен` or `Требуется верификация`. This does not imply staff
phone/student verification. Related trainer IDs come from user_trainer_links, deduplicated
and sorted, limited to users visible in the admin source. No trainer notes are exported.
`sync_status=Синхронизирован`; synced_at is UTC for the snapshot. No DB writes are performed.

After deployment:
1. Activate the intended space, click the all-users action, compare sourceUsers with the
   unfiltered admin list/source query and Google data row count (excluding header).
2. Check unique user_id, separate structured fields, explicit trainer/admin flags, status,
   and profile verification. Inspect an ADMIN without trainer=true and a nickname-only user.
3. Repeat: identical IDs/count/values except synced_at. A changed profile/contact/role/status
   refreshes on the same UUID. Permanent deletion removes that UUID from the next snapshot.
4. On Google API failure, resolve access/API error and retry; no scheduler or user import exists.

Tests cover snapshot cleanup/idempotency, updates, FIO fallbacks, independent role flags,
soft-deleted inclusion through the actual panel repository source, transport failure, and
browser explicit action/pending/repeat/error/active-space behavior. Live execution is recorded
separately in the task handoff; code delivery does not deploy the new endpoint.
