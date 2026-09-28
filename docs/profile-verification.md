# Profile verification and structured names

Profile verification is computed by `ProfileServiceUtil.missingFields`; it is independent of account role/status, `phoneVerifiedByStaff` and student/trainer relationship verification.

Required fields: `profiles.surname`, `first_name`, `patronymic`, plus a valid Russian `users.phone`. Blank name parts and invalid phone cannot complete a profile. Nickname, avatar, birth date and gender are optional for completion. Legacy full name and nickname never supply missing name parts.

`GET /api/account/me`, `PATCH /api/account/profile` and the about-me response expose `profileCompleted`, its inverse `profileVerificationRequired`, and `profileMissingFields` (API field names). Profile saves recompute the stored completion flag; profile reads are read-only. This does not downgrade ACTIVE users or unblock blocked accounts. Existing partial profile updates remain supported; rejected requests leave saved data unchanged.

Authenticated users can open the main menu with an incomplete profile. The yellow `Пройти верификацию` link sits next to `Расписание 2.0` (or alone for users without that shortcut). Other onboarding route restrictions remain. The link opens `/profile?verify=1`, loads actual stored values without splitting display names, and shows missing fields returned by the backend. Completion uses the save response; subsequent SPA navigation back home fetches current account state and removes the CTA. If the backend still reports missing data, the form remains open with updated guidance. Settings edits retain their existing profile refresh after save.

## Display names

`ProfileDisplayName` resolves explicit profile parts, then legacy full name, nickname, and an allowed visible phone (or `Без имени`). Member list responses now carry `displayName`, with profile loading in one batch including linked trainers; nickname remains separate and phone visibility is applied before fallback. Member details, public profiles, trainer selection and attendance export use the same priority. Frontend cards use the returned display name; the current profile also prioritizes structured fields.

## Google Sheets

The existing admin manual sync button now runs the trainer export followed by the participant export. Separate endpoints are `POST /api/panel/google-sheet-spaces/active/sync-trainers` and `/active/sync-participants`. If the second export fails, trainer success remains visible alongside the error; retry is safe. There is no periodic scheduler for these exports. `ProfileSheetSyncListener` also triggers all-users, participant and trainer exports after a profile-save transaction commits, using independent transactions. No live Sheet operation is part of this cleanup.

`PersonSheetPlan` handles the trainer mirror and writes `Фамилия`/`surname`, `Имя`/`first_name`/`name`, `Отчество`/`patronymic` exclusively from structured profile fields, clearing stale values when those fields are absent. `Имя` is not an alias for the display-name column. The trainer display column is `ФИО` (aliases: `тренер`, `display_name`, `full_name`); nickname is also written separately to `Ник`. Missing columns are appended; conflicting aliases fail before writing.

The trainer mirror reconciles by `user_id` only, preserves physical rows, existing personal-sheet references and unmanaged cells, and marks unmatched/duplicate/deleted rows inactive. UUID-less historical trainer rows are not guessed from names or phones; they remain inactive and the DB identity gets its own row. For a nondeleted trainer without a personal-sheet URL, `TrainerSheetSyncService` calls `ensureTrainerSpace` and records the returned URL. Personal sheets are not deleted.

The participant mirror uses a separate `ParticipantSheetPlan`. Candidates are nondeleted, nontrainer users with status `ACTIVE` or `PROFILE_INCOMPLETE`. It builds a complete snapshot with structured name parts, nickname and phone, filtering duplicate UUIDs and nonblank phones/nicknames. `ParticipantSheetWriter` clears and replaces the participant snapshot and trainer lookup; old physical rows and unmanaged cells within that range are not preserved. Existing valid trainer choices are recovered by participant UUID and trainer UUID, with exact directory-label recovery for broken legacy formulas; primary trainer links provide the fallback. Both exports use the active-space DB lock and RAW value writes. Credentials and student verification workflows are unchanged.

Live Google permissions, real spreadsheet headers and production deployment need orchestrator verification. Unit tests use a gateway simulation/captured cell updates; browser tests use mocked HTTP APIs.
