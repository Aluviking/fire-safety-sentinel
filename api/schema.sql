-- Portal Empresarial SISO — esquema de base de datos
-- Pega este archivo completo en phpMyAdmin > (tu base de datos) > pestaña "SQL" > Continuar/Ejecutar.
-- Crea todas las tablas y los datos iniciales (usuarios demo + empresas) de una sola vez.

SET NAMES utf8mb4;

-- ─── Empresas ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id         VARCHAR(40)  NOT NULL PRIMARY KEY,
  nombre     VARCHAR(190) NOT NULL,
  nit        VARCHAR(40)  NOT NULL,
  sector     VARCHAR(80)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Usuarios ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  NOT NULL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('super_admin','admin','equipo','cliente') NOT NULL DEFAULT 'cliente',
  empresa_id    VARCHAR(40)  NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Sesiones (tokens de login) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  token      VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id    VARCHAR(40) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Permisos (usuario Equipo × Empresa) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  equipo_user_id     VARCHAR(40) NOT NULL,
  empresa_id         VARCHAR(40) NOT NULL,
  can_edit           TINYINT(1)  NOT NULL DEFAULT 0,
  can_upload         TINYINT(1)  NOT NULL DEFAULT 0,
  cliente_can_upload TINYINT(1)  NOT NULL DEFAULT 0,
  granted_by         VARCHAR(40) NOT NULL,
  granted_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_equipo_empresa (equipo_user_id, empresa_id),
  FOREIGN KEY (equipo_user_id) REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (empresa_id)     REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Documentos subidos (PHVA) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id        VARCHAR(40)  NOT NULL,
  phva_phase        CHAR(1)      NOT NULL, -- P, H, V o A
  folder_name       VARCHAR(190) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename   VARCHAR(255) NOT NULL, -- nombre real en disco (aleatorio, no adivinable)
  size_bytes        INT UNSIGNED NOT NULL,
  mime_type         VARCHAR(120) NOT NULL,
  uploaded_by       VARCHAR(40)  NOT NULL,
  uploaded_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id)  REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)      ON DELETE CASCADE,
  INDEX idx_folder (empresa_id, phva_phase, folder_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Registro de auditoría ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_trace (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    VARCHAR(40)  NOT NULL,
  user_name  VARCHAR(150) NOT NULL,
  user_role  VARCHAR(20)  NOT NULL,
  action     VARCHAR(50)  NOT NULL,
  empresa_id VARCHAR(40)  NULL,
  detail     VARCHAR(255) NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Datos iniciales: empresas (las mismas 8 que ya existían en el mock) ─────
INSERT INTO companies (id, nombre, nit, sector) VALUES
  ('1', 'Inversiones Caribe S.A.S',      '900.123.456-7', 'Financiero'),
  ('2', 'Constructora Andina LTDA',       '800.456.789-3', 'Construcción'),
  ('3', 'LogiCarga Express',              '901.234.567-1', 'Logística'),
  ('4', 'TechSoluciones Colombia',        '830.987.654-2', 'Tecnología'),
  ('5', 'Distribuidora El Progreso',      '800.765.432-8', 'Comercio'),
  ('6', 'Minería Sur Andina S.A.',        '900.321.654-5', 'Minería'),
  ('7', 'Alimentos Saludables del Valle', '830.654.321-0', 'Alimentos'),
  ('8', 'Grupo Hospitalario del Norte',   '891.000.234-9', 'Salud')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ─── Datos iniciales: usuarios demo ──────────────────────────────────────────
-- Contraseñas (cámbialas apenas puedas desde el panel, esto es solo para probar):
--   dev@siso.com      / SuperAdmin123!  (Super Admin — solo este rol crea/asciende Admins)
--   admin@siso.com    / Admin123!
--   equipo@siso.com   / Equipo123!
--   cliente@siso.com  / Cliente123!
INSERT INTO users (id, nombre, email, username, password_hash, role, empresa_id) VALUES
  ('superadmin-001', 'Super Admin (Desarrollador)', 'dev@siso.com',     'superadmin', '$2y$10$n6kB81iC3kqjKS3ATgCLauuI1Ddnethm.4mTRqH2ZQuViTdTqxnSe', 'super_admin', NULL),
  ('admin-001',   'Administrador SISO', 'admin@siso.com',   'admin',   '$2y$10$.PvslbyzJo7qgb8ivivyuO5jfFkHNlyYfWeJ7sBJ.u2aYKhwyRJgW', 'admin',   NULL),
  ('equipo-001',  'Consultor SISO',     'equipo@siso.com',  'equipo',  '$2y$10$PAVcs38ssZ7AApNXjMSEBukfVyZ3USA5AZOfo3Ty56QiEpxwn4mMK', 'equipo',  NULL),
  ('cliente-001', 'Cliente Demo',       'cliente@siso.com', 'cliente', '$2y$10$X4qLE70C18bRFWymbnw1feMv97bXq3o8fhouhaCER3o4hrluSoBEO', 'cliente', '1')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ─── Migración: foto de perfil de usuario ─────────────────────────────────────
-- Ejecuta esto en phpMyAdmin > SQL si tu base de datos ya existía antes de esta
-- columna (una sola vez; si la columna ya existe, MySQL lanzará un error inocuo
-- que puedes ignorar).
ALTER TABLE users ADD COLUMN avatar_path VARCHAR(255) NULL AFTER empresa_id;

-- ─── Migración: módulo de Publicidad (un solo anuncio activo 9:16) ───────────
-- Ejecuta esto en phpMyAdmin > SQL si tu base de datos ya existía antes de esta
-- tabla (una sola vez).
CREATE TABLE IF NOT EXISTS ads (
  id         INT          NOT NULL PRIMARY KEY,
  image_path VARCHAR(255) NULL,
  updated_by VARCHAR(40)  NULL,
  updated_at DATETIME     NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO ads (id) VALUES (1) ON DUPLICATE KEY UPDATE id = id;
