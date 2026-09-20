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
