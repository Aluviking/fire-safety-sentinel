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

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 1 — Institucional: Estudiantes, Docentes, Administrativos, Matrículas
-- ══════════════════════════════════════════════════════════════════════════
-- Nombre completo se guarda en un solo campo (no separado en nombre/apellido)
-- porque así vienen los datos reales del backup de Q10, y separar un nombre
-- completo en partes de forma automática no es confiable en español (nombres
-- compuestos, apellidos con "de la", etc.).

CREATE TABLE IF NOT EXISTS estudiantes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  identificacion  VARCHAR(30)  NOT NULL UNIQUE,
  nombre_completo VARCHAR(200) NOT NULL,
  genero          VARCHAR(20)  NULL,
  tipo_documento  VARCHAR(80)  NULL,
  celular         VARCHAR(30)  NULL,
  correo          VARCHAR(190) NULL,
  subgrupo_sisben VARCHAR(50)  NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Historial de matrícula de cada estudiante (un estudiante puede tener varias
-- a lo largo del tiempo — distintos períodos/programas).
CREATE TABLE IF NOT EXISTS matriculas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id     INT NOT NULL,
  estado            VARCHAR(50)  NULL,
  formalizada       TINYINT(1)   NULL,
  sede              VARCHAR(100) NULL,
  programa          VARCHAR(150) NULL,
  nivel             VARCHAR(50)  NULL,
  periodo           VARCHAR(30)  NULL,
  fecha_egreso      DATE NULL,
  fecha_cancelacion DATE NULL,
  acta              VARCHAR(50)  NULL,
  folio             VARCHAR(50)  NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS docentes (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  identificacion       VARCHAR(30)  NOT NULL UNIQUE,
  nombre_completo      VARCHAR(200) NOT NULL,
  genero               VARCHAR(20)  NULL,
  tipo_documento       VARCHAR(80)  NULL,
  municipio_expedicion VARCHAR(100) NULL,
  fecha_nacimiento     DATE NULL,
  municipio_nacimiento VARCHAR(100) NULL,
  telefono             VARCHAR(30)  NULL,
  celular              VARCHAR(30)  NULL,
  correo               VARCHAR(190) NULL,
  direccion            VARCHAR(200) NULL,
  municipio_residencia VARCHAR(100) NULL,
  tipo_sanguineo       VARCHAR(10)  NULL,
  escalafon            VARCHAR(100) NULL,
  calidad_desempeno    VARCHAR(100) NULL,
  nivel_academico      VARCHAR(100) NULL,
  especialidad         VARCHAR(150) NULL,
  fecha_ingreso        DATE NULL,
  tipo_vinculacion     VARCHAR(100) NULL,
  estado               VARCHAR(50)  NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS administrativos (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  identificacion       VARCHAR(30)  NOT NULL UNIQUE,
  nombre_completo      VARCHAR(200) NOT NULL,
  genero               VARCHAR(20)  NULL,
  tipo_documento       VARCHAR(80)  NULL,
  municipio_expedicion VARCHAR(100) NULL,
  fecha_nacimiento     DATE NULL,
  municipio_nacimiento VARCHAR(100) NULL,
  telefono             VARCHAR(30)  NULL,
  celular              VARCHAR(30)  NULL,
  correo               VARCHAR(190) NULL,
  direccion            VARCHAR(200) NULL,
  municipio_residencia VARCHAR(100) NULL,
  tipo_sanguineo       VARCHAR(10)  NULL,
  cargo                VARCHAR(100) NULL,
  escalafon            VARCHAR(100) NULL,
  calidad_desempeno    VARCHAR(100) NULL,
  nivel_academico      VARCHAR(100) NULL,
  especialidad         VARCHAR(150) NULL,
  fecha_ingreso        DATE NULL,
  tipo_vinculacion     VARCHAR(100) NULL,
  estado               VARCHAR(50)  NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 2 — Tesorería: Créditos, Pagos, Codeudores, Notas de crédito
-- ══════════════════════════════════════════════════════════════════════════
-- Solo lo que el backup realmente tiene datos para poblar (crédito educativo
-- del estudiante y sus pagos). "Otros Ingresos", "Egresos" y la parte de
-- Estructuración contable (Impuestos, Productos, Cuentas, Terceros, Formas de
-- pago) quedan pendientes — no hay datos reales que migrar ahí todavía.

CREATE TABLE IF NOT EXISTS codeudores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  identificacion  VARCHAR(30)  NOT NULL UNIQUE,
  nombre_completo VARCHAR(200) NOT NULL,
  celular         VARCHAR(30)  NULL,
  correo          VARCHAR(190) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- El backup solo trae el número de identificación del codeudor (no su nombre
-- ni contacto), así que no se puede enlazar con FK a una tabla de codeudores
-- que todavía no tiene esos registros — queda como texto simple.
CREATE TABLE IF NOT EXISTS creditos (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  identificacion_estudiante VARCHAR(30)   NULL,
  identificacion_codeudor   VARCHAR(30)   NULL,
  periodo                   VARCHAR(30)   NULL,
  pagare                    VARCHAR(50)   NULL,
  fecha_credito             DATE          NULL,
  valor_credito             DECIMAL(14,2) NULL,
  interes_corriente         DECIMAL(6,3)  NULL,
  interes_mora              DECIMAL(6,3)  NULL,
  num_cuotas                INT           NULL,
  dias_gracia               INT           NULL,
  valor_pago_anticipado     DECIMAL(14,2) NULL,
  periodicidad_cuotas       VARCHAR(50)   NULL,
  observaciones             TEXT          NULL,
  anulado                   VARCHAR(10)   NULL,
  asesor                    VARCHAR(150)  NULL,
  paz_y_salvo               VARCHAR(10)   NULL,
  observaciones_paz_y_salvo TEXT          NULL,
  fecha_paz_y_salvo         DATE          NULL,
  producto                  VARCHAR(150)  NULL,
  valor_producto            DECIMAL(14,2) NULL,
  cantidad                  INT           NULL,
  descuento_producto        DECIMAL(14,2) NULL,
  valor_descuento           DECIMAL(14,2) NULL,
  impuesto_producto         DECIMAL(14,2) NULL,
  valor_impuesto            DECIMAL(14,2) NULL,
  fecha_programada_cuota    DATE          NULL,
  valor_cuota               DECIMAL(14,2) NULL,
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_creditos_estudiante (identificacion_estudiante),
  INDEX idx_creditos_pagare (pagare)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pagos_creditos (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  pagare                 VARCHAR(50)   NULL,
  comprobante            VARCHAR(50)   NULL,
  fecha_pago             DATE          NULL,
  cajero                 VARCHAR(150)  NULL,
  fecha_asiento          DATE          NULL,
  valor                  DECIMAL(14,2) NULL,
  estado                 VARCHAR(50)   NULL,
  responsable_anulacion  VARCHAR(150)  NULL,
  responsable_devolucion VARCHAR(150)  NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagos_creditos_pagare (pagare)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pagos_pendientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  identificacion  VARCHAR(30)   NULL,
  producto        VARCHAR(150)  NULL,
  periodo         VARCHAR(30)   NULL,
  valor_producto  DECIMAL(14,2) NULL,
  cantidad        INT           NULL,
  impuesto        DECIMAL(14,2) NULL,
  valor_impuesto  DECIMAL(14,2) NULL,
  descuento       DECIMAL(14,2) NULL,
  valor_descuento DECIMAL(14,2) NULL,
  recibo_abonos   VARCHAR(100)  NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagos_pendientes_ident (identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pagos_realizados (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  identificacion         VARCHAR(30)   NULL,
  comprobante            VARCHAR(50)   NULL,
  fecha_pago             DATE          NULL,
  fecha_asiento          DATE          NULL,
  cajero                 VARCHAR(150)  NULL,
  producto               VARCHAR(150)  NULL,
  periodo                VARCHAR(30)   NULL,
  valor_pagado           DECIMAL(14,2) NULL,
  cuenta                 VARCHAR(100)  NULL,
  forma_pago             VARCHAR(100)  NULL,
  valor_forma_pago       DECIMAL(14,2) NULL,
  estado                 VARCHAR(50)   NULL,
  responsable_anulacion  VARCHAR(150)  NULL,
  responsable_devolucion VARCHAR(150)  NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pagos_realizados_ident (identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notas_credito (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  identificacion        VARCHAR(30)   NULL,
  numero                VARCHAR(50)   NULL,
  fecha                 DATE          NULL,
  periodo               VARCHAR(30)   NULL,
  cajero                VARCHAR(150)  NULL,
  producto              VARCHAR(150)  NULL,
  valor_producto        DECIMAL(14,2) NULL,
  porcentaje_impuesto   DECIMAL(6,3)  NULL,
  cantidad              INT           NULL,
  estado                VARCHAR(50)   NULL,
  responsable_anulacion VARCHAR(150)  NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notas_credito_ident (identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 4 — Informes (+ 2 tablas del backup que no se habían usado en
-- ninguna fase anterior: Homologaciones/Habilitaciones y Modificaciones de
-- créditos). El resto de "Informes" son reportes agregados sobre datos que
-- ya existen (creditos, pagos_pendientes, pagos_realizados, notas_credito,
-- notas_finales), sin tablas nuevas.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS homologaciones (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  identificacion_estudiante VARCHAR(30)  NULL,
  tipo                      VARCHAR(50)  NULL,
  asignatura                VARCHAR(200) NULL,
  institucion_origen        VARCHAR(200) NULL,
  nota                      DECIMAL(6,2) NULL,
  observaciones             TEXT         NULL,
  estado                    VARCHAR(50)  NULL,
  periodo                   VARCHAR(30)  NULL,
  docente                   VARCHAR(200) NULL,
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_homologaciones_estudiante (identificacion_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS modificaciones_creditos (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  pagare                   VARCHAR(50)   NULL,
  nota_modificacion        VARCHAR(100)  NULL,
  valor_anterior           DECIMAL(14,2) NULL,
  valor_posterior          DECIMAL(14,2) NULL,
  valor_nota_credito       DECIMAL(14,2) NULL,
  fecha                    DATE          NULL,
  justificacion            TEXT          NULL,
  cajero                   VARCHAR(150)  NULL,
  anulado                  VARCHAR(10)   NULL,
  fecha_anulacion          DATE          NULL,
  cajero_anulacion         VARCHAR(150)  NULL,
  justificacion_anulacion  TEXT          NULL,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_modificaciones_creditos_pagare (pagare)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 3a — Académico: Estructuración (Programas, Asignaturas, Cursos)
-- ══════════════════════════════════════════════════════════════════════════
-- Asignaturas queda como catálogo reutilizable (una asignatura puede
-- pertenecer a varios programas), tal como pidió el cliente — se enlaza vía
-- la tabla intermedia programa_asignaturas.
-- El campo "programa_asignatura_jornada" de cursos se guarda tal cual viene
-- del backup (texto libre "Programa - Asignatura - Jornada"): forzar su
-- separación en 3 columnas distintas con texto libre real es la forma más
-- fácil de corromper datos que ya existen.

CREATE TABLE IF NOT EXISTS programas (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  codigo                    VARCHAR(30)  NULL,
  nombre                    VARCHAR(200) NOT NULL,
  pensum                    VARCHAR(200) NULL,
  abreviacion               VARCHAR(200) NULL,
  num_resolucion            VARCHAR(50)  NULL,
  fecha_resolucion          DATE         NULL,
  disponible_oferta_laboral VARCHAR(10)  NULL,
  estado                    VARCHAR(50)  NULL,
  aplica_preinscripcion     VARCHAR(10)  NULL,
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_programa_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asignaturas (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  codigo                 VARCHAR(30)   NULL,
  nombre                 VARCHAR(200)  NOT NULL,
  abreviacion            VARCHAR(200)  NULL,
  intensidad_semanal     INT           NULL,
  intensidad_total       INT           NULL,
  nivel                  VARCHAR(50)   NULL,
  num_creditos           DECIMAL(6,2)  NULL,
  aplica_practica_laboral VARCHAR(10)  NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_asignatura_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Relación muchos-a-muchos: una asignatura puede repetirse en varios
-- programas, tal como pidió el cliente explícitamente.
CREATE TABLE IF NOT EXISTS programa_asignaturas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  programa_id    INT NOT NULL,
  asignatura_id  INT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_programa_asignatura (programa_id, asignatura_id),
  FOREIGN KEY (programa_id)   REFERENCES programas(id)   ON DELETE CASCADE,
  FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cursos (
  id                          INT AUTO_INCREMENT PRIMARY KEY,
  codigo_nombre               VARCHAR(200) NULL,
  programa_id                 INT          NULL,
  asignatura_id               INT          NULL,
  programa_asignatura_jornada VARCHAR(255) NULL,
  tipo_evaluacion             VARCHAR(50)  NULL,
  cupo_maximo                 INT          NULL,
  fecha_inicio                DATE         NULL,
  fecha_fin                   DATE         NULL,
  aula                        VARCHAR(100) NULL,
  cerrado                     VARCHAR(10)  NULL,
  archivado                   VARCHAR(10)  NULL,
  docente_identificacion      VARCHAR(30)  NULL,
  docente_nombre              VARCHAR(200) NULL,
  horario                     VARCHAR(150) NULL,
  periodo                     VARCHAR(30)  NULL,
  created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cursos_periodo (periodo),
  INDEX idx_cursos_docente (docente_identificacion),
  FOREIGN KEY (programa_id)   REFERENCES programas(id)   ON DELETE SET NULL,
  FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 3b — Académico: Evaluaciones
-- ══════════════════════════════════════════════════════════════════════════
-- "evaluaciones" es el detalle granular (un registro por parámetro de
-- evaluación, ej. "QUIZ 1", "ESTRELLA"); "notas_finales" es el resumen ya
-- consolidado por asignatura/período que trae el backup. El cliente pidió un
-- solo ítem de menú ("Evaluaciones") pero ambos niveles son datos reales que
-- no pueden quedar fuera, así que se muestran como 2 pestañas del mismo módulo.
-- Igual que en cursos, se referencia al estudiante por identificación (sin FK
-- estricta), mismo patrón ya usado en creditos/pagos.

CREATE TABLE IF NOT EXISTS evaluaciones (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  codigo_curso              VARCHAR(50)   NULL,
  periodo                   VARCHAR(30)   NULL,
  identificacion_estudiante VARCHAR(30)   NULL,
  asignatura                VARCHAR(200)  NULL,
  parametro                 VARCHAR(200)  NULL,
  porcentaje                DECIMAL(6,2)  NULL,
  nota                      DECIMAL(6,2)  NULL,
  inasistencias             INT           NULL,
  observaciones             TEXT          NULL,
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evaluaciones_estudiante (identificacion_estudiante),
  INDEX idx_evaluaciones_curso (codigo_curso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 3c — Académico: Educación virtual (Aulas virtuales)
-- ══════════════════════════════════════════════════════════════════════════
-- El backup trae un registro por asistente por sesión (ya viene "aplanado"),
-- así que se importa tal cual, una fila = una asistencia real a una sesión.
CREATE TABLE IF NOT EXISTS aulas_virtuales (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  fecha_inicio_sesion      DATETIME     NULL,
  fecha_fin_sesion         DATETIME     NULL,
  nombre_curso             VARCHAR(200) NULL,
  asignatura               VARCHAR(200) NULL,
  docente_nombre           VARCHAR(200) NULL,
  docente_identificacion   VARCHAR(30)  NULL,
  asistente_nombre         VARCHAR(200) NULL,
  asistente_identificacion VARCHAR(30)  NULL,
  asistente_externo        VARCHAR(10)  NULL,
  fecha_ingreso_real       DATETIME     NULL,
  fecha_salida_real        DATETIME     NULL,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aulas_virtuales_asistente (asistente_identificacion),
  INDEX idx_aulas_virtuales_curso (nombre_curso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notas_finales (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  identificacion_estudiante VARCHAR(30)   NULL,
  programa                  VARCHAR(200)  NULL,
  periodo                   VARCHAR(30)   NULL,
  asignatura                VARCHAR(200)  NULL,
  aprobado                  VARCHAR(1)    NULL,
  nota_asignatura           DECIMAL(6,2)  NULL,
  promedio_acumulado        DECIMAL(6,2)  NULL,
  tipo_nota                 VARCHAR(50)   NULL,
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notas_finales_estudiante (identificacion_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
