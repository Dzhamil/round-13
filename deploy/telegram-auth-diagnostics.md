# Telegram Mini App authentication diagnostics

Deploy the backend and frontend from the reviewed fix together (backend first if deployed separately).
`POST /api/auth/telegram-diagnostics` is public and accepts validated metadata only. It emits
`Telegram auth client diagnostic` records to the backend application log. It does not persist
credentials or accept free-form messages. Invalid payloads return 400 without logging parser
exceptions. At most 120 valid events/minute are logged per backend instance; excess events are
silently dropped. Delivery is best effort and never blocks login; an offline client cannot deliver
its diagnostics until connectivity exists (no offline queue).

The frontend reads the current `window.Telegram.WebApp` every 250 ms for up to 4 seconds.
Once initData exists, login has at most 3 attempts, each with an 8-second request timeout, with
500/1000 ms delays. Network errors, timeouts, 5xx, 408 and 429 can retry. Other 4xx stop immediately.
The manual retry control appears only after this flow fails. Unmount cancels both timers and requests.

Categories:
- `missing_init_data`: first read empty; waiting, not terminal.
- `init_data_timeout`: initialization window exhausted without login request.
- `transient_failure`: retryable login failure; attemptCount identifies the login attempt (1–3).
- `permanent_auth_failure`: non-retryable login failure.
- `aborted`: flow cancelled during wait/request/backoff.
- `success`: login completed.

Other fields: hasInitData, initDataLength (capped), platform, WebApp version, fixed `/auth` route,
release, elapsedMs, attemptCount (0 during initData wait). Release is the build checkout's Git SHA,
or a build timestamp identifier when `.git` is unavailable. Query strings, URL fragments, raw
initData, backend error bodies, tokens, and passwords are excluded.

Verification:

```sh
cd frontend
npm run build
PLAYWRIGHT_SERVE_DIST=1 npx playwright test e2e/auth-environment.spec.ts e2e/telegram-auth-abort.spec.ts --workers=2
```

This serves the actual production bundle with Vite preview and checks ordinary web auth and the
Telegram-only path, including delayed initData, exhaustion, transient/permanent failure and cancellation.
Do not use a dev server already listening on the preview port (5174).

After orchestrator review and deploy, open the deployed app in Telegram on a real iPhone. Verify
login, absence of phone/password controls, and a successful `/api/auth/telegram-login` request.
For a failure, inspect the safe diagnostic category/release/elapsed/attempt fields alongside nginx
access logs and existing backend Telegram validation logs. Verify that the loaded asset hashes belong
to the new release. Browser tests use transport fixtures; they do not establish that real Telegram
signatures or the iOS bridge work in production.
