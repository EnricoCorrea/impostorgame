-- Dados idempotentes para testar cadastro/login, salas e inicio de partida.
-- Senha padrao dos usuarios abaixo: 123456.

UPDATE users
SET
  name = seed.name,
  password = seed.password,
  role = seed.role
FROM (
  VALUES
    ('Admin', 'admin@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'ADMIN'),
    ('Ana', 'ana@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER'),
    ('Bruno', 'bruno@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER')
) AS seed(name, email, password, role)
WHERE users.email = seed.email;

INSERT INTO users (name, email, password, role, created_at)
SELECT seed.name, seed.email, seed.password, seed.role, NOW()
FROM (
  VALUES
    ('Admin', 'admin@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'ADMIN'),
    ('Ana', 'ana@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER'),
    ('Bruno', 'bruno@impostor.local', '$2b$10$9qTgn1x1bbiK5h8DT2GzaehwzM2GBddqAWW.s7hI0UjQbGfPUU2y2', 'PLAYER')
) AS seed(name, email, password, role)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.email = seed.email
);

INSERT INTO words (word, impostor_clue)
SELECT seed.word, seed.impostor_clue
FROM (
  VALUES
    ('Praia', 'Lugar'),
    ('Pizza', 'Comida'),
    ('Aviao', 'Transporte'),
    ('Biblioteca', 'Silencio'),
    ('Futebol', 'Esporte')
) AS seed(word, impostor_clue)
WHERE NOT EXISTS (
  SELECT 1 FROM words WHERE words.word = seed.word
);

INSERT INTO rooms (name, host_id, status, max_users, created_at)
SELECT 'Sala de demonstracao', id, 'WAITING', 5, NOW()
FROM users
WHERE email = 'admin@impostor.local'
  AND NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Sala de demonstracao');

INSERT INTO room_users (room_id, user_id)
SELECT r.id, u.id
FROM rooms r
CROSS JOIN users u
WHERE r.name = 'Sala de demonstracao'
  AND u.email IN ('admin@impostor.local', 'ana@impostor.local', 'bruno@impostor.local')
  AND NOT EXISTS (
    SELECT 1
    FROM room_users ru
    WHERE ru.room_id = r.id
      AND ru.user_id = u.id
  );
