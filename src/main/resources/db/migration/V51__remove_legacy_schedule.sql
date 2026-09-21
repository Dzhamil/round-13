-- The only incoming FK to training_sessions is owned by training_participants.
-- Do not use CASCADE: any unexpected dependency must abort the migration.
DROP TABLE training_participants;
DROP TABLE training_sessions;

-- Club events also contain competitions, camps and announcements. Keep those tables.
-- Remove only the retired trainer-created training flow and its registrations.
DELETE FROM club_event_participants
WHERE event_id IN (SELECT id FROM club_events WHERE type = 'COACH_TRAINING');
DELETE FROM club_events WHERE type = 'COACH_TRAINING';
ALTER TABLE club_events ADD CONSTRAINT chk_club_events_no_legacy_training
    CHECK (type <> 'COACH_TRAINING');

-- Invalidate attendance aggregates from the retired schedule; preserve boxing stats.
UPDATE user_stats
SET points = GREATEST(0, points - GREATEST(0, trainings_attended_count)),
    trainings_attended_count = 0,
    trainings_missed_count = 0;
