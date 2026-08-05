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

-- ─── Permisos (usuario Equipo o Cliente × Empresa) ───────────────────────────
-- 4 permisos independientes, otorgados por Admin/Super Admin por usuario
-- específico y por empresa específica — aplica igual para Equipo que para
-- Cliente (antes Cliente solo tenía un flag genérico "cliente_can_upload" por
-- empresa; ahora es granular por usuario, igual que Equipo).
CREATE TABLE IF NOT EXISTS permissions (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            VARCHAR(40) NOT NULL,
  empresa_id         VARCHAR(40) NOT NULL,
  can_view           TINYINT(1)  NOT NULL DEFAULT 0,
  can_upload         TINYINT(1)  NOT NULL DEFAULT 0,
  can_edit           TINYINT(1)  NOT NULL DEFAULT 0,
  can_download       TINYINT(1)  NOT NULL DEFAULT 0,
  granted_by         VARCHAR(40) NOT NULL,
  granted_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_empresa (user_id, empresa_id),
  FOREIGN KEY (user_id)        REFERENCES users(id)     ON DELETE CASCADE,
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

-- ─── Migración: foto de portada + edición de empresa ─────────────────────────
-- Ejecuta esto en phpMyAdmin > SQL si tu base de datos ya existía antes de esta
-- columna (una sola vez; si ya existe, MySQL lanzará un error inocuo a ignorar).
ALTER TABLE companies ADD COLUMN photo_path VARCHAR(255) NULL AFTER sector;

-- ─── Migración: carpetas personalizadas del PHVA (por empresa) ──────────────
-- Ejecuta esto en phpMyAdmin > SQL si tu base de datos ya existía antes de esta
-- tabla (una sola vez).
CREATE TABLE IF NOT EXISTS custom_folders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id  VARCHAR(40)  NOT NULL,
  phva_phase  CHAR(1)      NOT NULL,
  folder_name VARCHAR(190) NOT NULL,
  created_by  VARCHAR(40)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_empresa_fase_carpeta (empresa_id, phva_phase, folder_name),
  FOREIGN KEY (empresa_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Migración: carpetas estándar del PHVA ahora editables/eliminables ───────
-- Las 26 carpetas estándar (Política de SST, etc.) pasan a vivir en
-- custom_folders para TODAS las empresas ya creadas, igual que las que un
-- admin cree a mano — así el botón de editar/eliminar les aplica por igual.
-- Ejecuta esto en phpMyAdmin > SQL una sola vez (es seguro re-ejecutarlo,
-- el NOT EXISTS evita duplicados).
INSERT INTO custom_folders (empresa_id, phva_phase, folder_name, created_by)
SELECT c.id, f.phase, f.name,
       (SELECT u.id FROM users u WHERE u.role = 'super_admin' ORDER BY u.created_at LIMIT 1)
FROM companies c
CROSS JOIN (
  SELECT 'P' AS phase, 'Política de SST' AS name UNION ALL
  SELECT 'P', 'Objetivos e Indicadores SST' UNION ALL
  SELECT 'P', 'Identificación de Peligros' UNION ALL
  SELECT 'P', 'Matriz de Requisitos Legales' UNION ALL
  SELECT 'P', 'Programa de Gestión SST' UNION ALL
  SELECT 'P', 'Plan de Trabajo Anual' UNION ALL
  SELECT 'P', 'Roles y Responsabilidades' UNION ALL
  SELECT 'H', 'Capacitaciones y Entrenamientos' UNION ALL
  SELECT 'H', 'Inspecciones de Seguridad' UNION ALL
  SELECT 'H', 'Investigación de Incidentes' UNION ALL
  SELECT 'H', 'Elementos de Protección Personal' UNION ALL
  SELECT 'H', 'Gestión de Contratistas' UNION ALL
  SELECT 'H', 'Simulacros y Emergencias' UNION ALL
  SELECT 'H', 'Exámenes Médicos Ocupacionales' UNION ALL
  SELECT 'V', 'Indicadores de Gestión SST' UNION ALL
  SELECT 'V', 'Auditorías Internas' UNION ALL
  SELECT 'V', 'Revisión por la Dirección' UNION ALL
  SELECT 'V', 'Registro de Accidentes de Trabajo' UNION ALL
  SELECT 'V', 'Enfermedades Laborales' UNION ALL
  SELECT 'V', 'No Conformidades' UNION ALL
  SELECT 'V', 'Estadísticas de Siniestralidad' UNION ALL
  SELECT 'A', 'Acciones Correctivas' UNION ALL
  SELECT 'A', 'Acciones Preventivas' UNION ALL
  SELECT 'A', 'Plan de Mejora Continua' UNION ALL
  SELECT 'A', 'Lecciones Aprendidas' UNION ALL
  SELECT 'A', 'Actualizaciones del SG-SST'
) f
WHERE NOT EXISTS (
  SELECT 1 FROM custom_folders cf
  WHERE cf.empresa_id = c.id AND cf.phva_phase = f.phase AND cf.folder_name = f.name
);

-- ─── Migración: subcarpetas (1 nivel) + relación real documento↔carpeta ──────
-- Ejecuta esto en phpMyAdmin > SQL una sola vez. Es seguro: solo agrega
-- columnas y hace un backfill de los documentos que ya existen, no borra ni
-- modifica ningún archivo ni fila existente.

-- 1) Una carpeta puede ser subcarpeta de otra (NULL = carpeta de primer nivel).
ALTER TABLE custom_folders ADD COLUMN parent_folder_id INT NULL AFTER phva_phase;
ALTER TABLE custom_folders ADD FOREIGN KEY (parent_folder_id) REFERENCES custom_folders(id) ON DELETE CASCADE;

-- 2) Se quita el índice único anterior: con subcarpetas, dos carpetas con
-- padres distintos SÍ pueden tener el mismo nombre (ej. una subcarpeta
-- "Reportes" dentro de dos carpetas distintas). La validación de nombres
-- duplicados dentro del MISMO padre ahora la hace el propio endpoint
-- folders/create.php antes de insertar.
-- Nota: el índice único también sostenía la llave foránea de empresa_id, así
-- que primero se crea un índice de reemplazo antes de borrar el viejo
-- (si no, MySQL da el error 1553 "necesario en una restricción de clave foránea").
ALTER TABLE custom_folders ADD INDEX idx_custom_folders_empresa (empresa_id);
ALTER TABLE custom_folders DROP INDEX uniq_empresa_fase_carpeta;

-- 3) Cada documento pasa a apuntar directamente a su carpeta real (antes se
-- relacionaba solo por texto — empresa_id + fase + nombre de carpeta —, lo
-- cual no distingue una subcarpeta de otra con el mismo nombre).
ALTER TABLE documents ADD COLUMN folder_id INT NULL AFTER folder_name;
ALTER TABLE documents ADD FOREIGN KEY (folder_id) REFERENCES custom_folders(id) ON DELETE CASCADE;

-- 4) Backfill: conecta los documentos que ya existen con su carpeta real
-- (todas las carpetas de primer nivel ya existen en custom_folders gracias
-- a la migración anterior, así que este UPDATE encuentra siempre su pareja).
UPDATE documents d
JOIN custom_folders cf
  ON cf.empresa_id = d.empresa_id
 AND cf.phva_phase = d.phva_phase
 AND cf.folder_name = d.folder_name
 AND cf.parent_folder_id IS NULL
SET d.folder_id = cf.id
WHERE d.folder_id IS NULL;

-- ── Corrección de zona horaria (Historial y fechas de documentos) ──────────
-- Hostinger deja MySQL en UTC por defecto, así que CURRENT_TIMESTAMP quedaba
-- 5 horas adelantado respecto a la hora real de Colombia (Bogotá = UTC-5,
-- sin horario de verano, el desfase nunca cambia). La conexión ya se corrigió
-- en api/bootstrap.php (SET time_zone) para que lo nuevo quede bien desde
-- ahora — esto corrige lo que ya estaba guardado. Solo toca las dos columnas
-- que realmente se muestran en pantalla (Historial y fecha de documentos);
-- no toca sessions.expires_at ni ninguna otra fecha que no se vea en la UI.
UPDATE audit_trace SET created_at = DATE_SUB(created_at, INTERVAL 5 HOUR);
UPDATE documents    SET uploaded_at = DATE_SUB(uploaded_at, INTERVAL 5 HOUR);
