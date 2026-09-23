-- Schedule 1.0 owns sessions with schedule2_enabled = false (V47 default).
-- Schedule 2.0 and trainer-sheet imports share these tables but explicitly set true.
-- Hard deletion also removes every associated training_participant via the existing
-- fk_training_participants_session ON DELETE CASCADE. No transfer or backfill.
DELETE FROM training_sessions WHERE schedule2_enabled = false;
