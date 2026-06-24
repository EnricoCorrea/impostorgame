-- Dados idempotentes para testar cadastro/login, salas e início de partida.
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'ADMIN'),
  ('Ana', 'ana@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER'),
  ('Bruno', 'bruno@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO words (word, impostor_clue) VALUES
  ('Praia', 'Lugar'),
  ('Pizza', 'Comida'),
  ('Avião', 'Transporte'),
  ('Biblioteca', 'Silêncio'),
  ('Futebol', 'Esporte')
ON CONFLICT (word) DO NOTHING;

INSERT INTO rooms (name, host_id, status, max_users)
SELECT 'Sala de demonstração', id, 'WAITING', 5
FROM users
WHERE email = 'admin@impostor.local'
  AND NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Sala de demonstração');

INSERT INTO room_users (room_id, user_id)
SELECT r.id, u.id
FROM rooms r
CROSS JOIN users u
WHERE r.name = 'Sala de demonstração'
  AND u.email IN ('admin@impostor.local', 'ana@impostor.local', 'bruno@impostor.local')
ON CONFLICT DO NOTHING;
