-- Campus Virtual — esquema inicial (Fase 0: cimiento de usuarios y login).
-- Corre esto una sola vez en phpMyAdmin, sobre la base de datos nueva
-- (u828416914_campus_virtual), igual que se hizo con Portal Empresarial.

-- ─── Usuarios (cuentas que pueden iniciar sesión) ────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('super_admin','admin','docente','administrativo','estudiante','equipo') NOT NULL DEFAULT 'estudiante',
  avatar_path   VARCHAR(255) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Sesiones (tokens de login) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  token      VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Primer super_admin (para poder entrar la primera vez) ───────────────────
-- Usuario: superadmin  ·  Correo: superadmin@campus-virtual.local
-- Contraseña real (cámbiala o crea tu propia cuenta y borra esta apenas
-- puedas entrar): xzVs@Br87@BD!NCb
INSERT INTO users (id, nombre, email, username, password_hash, role) VALUES (
  'usr-7dd4fa04e144edd4',
  'Super Administrador',
  'superadmin@campus-virtual.local',
  'superadmin',
  '$2b$10$74VNHQbia3f8cSeBCMe2Be/QATNnayVtjPvwIsl0QqYoIEHcZrO3y',
  'super_admin'
);
