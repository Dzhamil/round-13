# Regression QA Harness

This frontend harness exercises the critical local browser flows from `TASK-20260515T181239Z-admin-round13-3980e6df`.

## Commands

```bash
cd frontend
npm run qa:e2e
npm run qa:e2e:headed
```

The Playwright config starts Vite over HTTP at `http://127.0.0.1:5174` by default. To use an already running local frontend, set its URL and disable the managed server:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 \
PLAYWRIGHT_SKIP_WEBSERVER=1 \
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
