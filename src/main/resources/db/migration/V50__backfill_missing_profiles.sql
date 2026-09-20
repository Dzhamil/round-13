-- Repair legacy accounts without changing account status or existing profile data.
INSERT INTO profiles (id, user_id, profile_completed)
SELECT gen_random_uuid(), u.id, FALSE
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
