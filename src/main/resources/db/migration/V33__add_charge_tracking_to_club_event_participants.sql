alter table club_event_participants
    add column if not exists charged_entitlement_id uuid,
    add column if not exists charged_at timestamptz;
