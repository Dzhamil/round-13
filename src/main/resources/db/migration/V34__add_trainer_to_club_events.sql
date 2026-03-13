alter table club_events
    add column if not exists trainer_user_id uuid;

alter table club_events
    drop constraint if exists fk_club_events_trainer;

alter table club_events
    add constraint fk_club_events_trainer
        foreign key (trainer_user_id) references users(id);

create index if not exists idx_club_events_trainer_user_id on club_events (trainer_user_id);
