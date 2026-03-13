create table if not exists user_entitlement_events (
    id uuid primary key,
    entitlement_id uuid not null,
    user_id uuid not null,
    type varchar(32) not null,
    delta integer not null,
    balance_after integer not null,
    club_event_id uuid,
    note varchar(512),
    created_at timestamptz not null default now(),

    constraint fk_user_entitlement_events_entitlement
        foreign key (entitlement_id) references user_entitlements(id) on delete cascade,
    constraint fk_user_entitlement_events_user
        foreign key (user_id) references users(id) on delete cascade,
    constraint fk_user_entitlement_events_club_event
        foreign key (club_event_id) references club_events(id) on delete set null
);

create index if not exists idx_user_entitlement_events_user_id_created_at
    on user_entitlement_events (user_id, created_at desc);

create index if not exists idx_user_entitlement_events_entitlement_id
    on user_entitlement_events (entitlement_id);
