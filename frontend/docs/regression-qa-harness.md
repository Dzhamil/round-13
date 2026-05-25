# Regression QA Harness

This frontend harness exercises the critical local browser flows from `TASK-20260515T181239Z-admin-round13-3980e6df`.

## Commands

```bash
cd frontend
npm run qa:e2e
npm run qa:e2e:headed
```

The Playwright config starts Vite by default. Override local endpoints when needed:

```bash
QA_FRONTEND_URL=https://localhost.127.0.0.1.nip.io:5174 \
QA_API_BASE_URL=http://127.0.0.1:18080 \
VITE_DEV_PORT=5174 \
npm run qa:e2e
```

If local Chromium rejects the self-signed nip.io module imports, run the same harness over local HTTP:

```bash
QA_FRONTEND_URL=http://127.0.0.1:5174 \
VITE_DEV_HOST=127.0.0.1 \
VITE_DEV_PORT=5174 \
VITE_DEV_HTTPS=false \
npm run qa:e2e
```

To run against a real disposable PostgreSQL database after Flyway migrations:

```bash
QA_DATABASE_URL=postgresql://round13:round13@localhost:15432/round13 npm run qa:seed
```

`qa:seed` applies `scripts/qa/seed-regression.sql`. The default local admin password is `qa-password`; override the bcrypt hash with `BOOTSTRAP_PANEL_ADMIN_PASSWORD_HASH` when needed.

## Covered P0 Flows

- `/profile/:id` public profile renders without client crash.
- Admin panel empty, wrong, valid login, and malformed users response behavior.
- Shop `/api/shop/products` `isActive` mapping, category purchase order creation, and direct product purchase entry point.
- Afisha event title visibility, tappability, and mobile horizontal overflow guard.
- Timetable exact training title or details visibility and mobile horizontal overflow guard.
