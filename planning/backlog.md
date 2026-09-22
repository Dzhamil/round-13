# Follow-up work

## Payment persistence for personal trainer sheets

- Source: owner task `TASK-20260922T172851566Z-admin-round13-9d99cffa`, item 10.
- Status: requires a separate owner-scoped model/migration task; outside this import's conditional storage scope.
- Current behavior: parser retains `Оплатил`; import does not persist it because no equivalent payment field exists.
- Decision needed: define payment meaning and storage before adding schema or connecting entitlement debits.
- Primary context: [trainer-sheet-sync.md](../docs/trainer-sheet-sync.md).
