# Profile verification and structured names

Profile verification is computed by `ProfileServiceUtil.missingFields`; it is independent of account role/status, `phoneVerifiedByStaff` and student/trainer relationship verification.

Required fields: `profiles.surname`, `first_name`, `patronymic`, a past `birth_date`, `gender` (`MALE`, `FEMALE`, `OTHER`), `avatar_url`, plus `users.nickname` and a valid Russian phone. Patronymic, nickname, phone and avatar were already mandatory; this change also requires birth date. Blank text, unsupported gender, invalid phone, and current/future birth dates cannot complete a profile. Legacy full name and nickname never supply missing name parts.

`GET /api/account/me`, `PATCH /api/account/profile`, `POST /api/account/complete-profile` and the about-me response expose `profileCompleted`, its inverse `profileVerificationRequired`, and `profileMissingFields` (API field names). Main profile reads/saves recompute the stored completion flag. This does not downgrade ACTIVE users or unblock blocked accounts. Existing partial profile updates remain supported; rejected requests leave saved data unchanged.

Authenticated users can open the main menu with an incomplete profile. The yellow `Пройти верификацию` link sits next to `Расписание 2.0` (or alone for users without that shortcut). Other onboarding route restrictions remain. The link opens `/profile/complete?verification=1`, loads actual stored values without splitting display names, and shows missing fields returned by the backend. Completion uses the save response; on success SPA navigation back home fetches current account state and removes the CTA. If the backend still reports missing data, the form remains open with updated guidance. Settings edits retain their existing profile refresh after save.

## Display names

`ProfileDisplayName` resolves explicit profile parts, then legacy full name, nickname, and an allowed visible phone (or `Без имени`). Member list responses now carry `displayName`, with profile loading in one batch including linked trainers; nickname remains separate and phone visibility is applied before fallback. Member details, public profiles, trainer selection and attendance export use the same priority. Frontend cards use the returned display name; the current profile also prioritizes structured fields.

## Google Sheets

The existing admin manual sync button now runs the trainer export followed by the participant export. Separate endpoints are `POST /api/panel/google-sheet-spaces/active/sync-trainers` and `/active/sync-participants`. If the second export fails, trainer success remains visible alongside the error; retry is safe. There is no automatic scheduler or live Sheet operation during implementation.

`PersonSheetPlan` is shared by both mirrors and writes `Фамилия`/`surname`, `Имя`/`first_name`/`name`, `Отчество`/`patronymic` exclusively from structured profile fields, clearing stale values when those fields are absent. `Имя` is no longer an alias for the display-name column. The display column is `ФИО` (aliases: `тренер`, `display_name`, `full_name`); nickname is also written separately to `Ник`. Missing columns are appended; conflicting aliases fail before writing.

The participant mirror includes all nondeleted club accounts, including trainers. Both mirrors reconcile by `user_id` only, preserve physical rows, personal-sheet references and unmanaged cells, and mark unmatched/duplicate/deleted rows inactive. UUID-less historical rows are not guessed from names or phones; they remain inactive and the DB identity gets its own row. Both exports use the active space DB lock and RAW cell updates. Existing staff-verification columns are unmanaged. No personal sheets are created/deleted; no changes to credentials, production environments, or student verification workflows.

Live Google permissions, real spreadsheet headers and production deployment need orchestrator verification. Unit tests use a gateway simulation/captured cell updates; browser tests use mocked HTTP APIs.
