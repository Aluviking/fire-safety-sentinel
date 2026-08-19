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

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 5 — Auditoría: quién editó/eliminó qué en los datos maestros
-- (Estudiantes, Docentes, Administrativos, Programas, Asignaturas, Cursos,
-- Codeudores, Usuarios). Estas acciones quedan exclusivas al Super Admin —
-- ver bootstrap.php (log_trace) y audit/list.php.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_trace (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    VARCHAR(40)  NOT NULL,
  user_name  VARCHAR(150) NOT NULL,
  user_role  VARCHAR(30)  NOT NULL,
  action     VARCHAR(50)  NOT NULL,
  detail     TEXT         NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_trace_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 6 — Educación virtual v2: Aulas virtuales como catálogo de salas
-- (nombre + capacidad máxima), igual a como se administraban en Q10. No
-- confundir con la tabla `aulas_virtuales` ya existente (esa es el registro
-- real de asistencia a sesiones, un concepto distinto, se deja intacta).
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS aulas_recursos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  capacidad_maxima  INT          NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_aula_recurso_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 7 — Educación virtual v2 (resto de módulos, sin datos importados de
-- Q10 — empiezan vacíos, se llenan a mano desde la interfaz).
-- ══════════════════════════════════════════════════════════════════════════

-- "Usuarios inscritos" es solo informativo (no hay sistema de inscripción de
-- estudiantes a cursos ligeros en este proyecto todavía) — el Super Admin lo
-- edita a mano si quiere reflejar un número real.
CREATE TABLE IF NOT EXISTS cursos_ligeros (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  nombre                VARCHAR(200) NOT NULL,
  categoria             VARCHAR(100) NULL,
  docente_identificacion VARCHAR(30) NULL,
  docente_nombre        VARCHAR(200) NULL,
  estado                VARCHAR(20)  NOT NULL DEFAULT 'No publicado',
  usuarios_inscritos    INT          NOT NULL DEFAULT 0,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS plantillas_educacion_virtual (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  asignatura_id INT         NULL,
  fecha         DATE        NULL,
  estado        VARCHAR(30) NOT NULL DEFAULT 'Creada',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- imagen_path guarda el nombre del archivo en `uploads_dir` (fuera de
-- public_html, servido solo vía certificados/image.php con autenticación),
-- mismo patrón que companies.photo_path en Portal Empresarial.
CREATE TABLE IF NOT EXISTS certificados_plantillas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(150) NOT NULL,
  imagen_path    VARCHAR(255) NULL,
  predeterminado TINYINT(1)   NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 8 — Detalle de Curso ligero (pestañas Ajustes/Contenido/Anuncios/
-- Clases virtuales/Usuarios, igual a como se veía en Q10). Como
-- `cursos_ligeros` ya existe en producción, esto es un ALTER (no se puede
-- meter en el CREATE TABLE de arriba) — correr manualmente igual que el
-- resto del esquema de este proyecto.
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE cursos_ligeros
  ADD COLUMN descripcion      TEXT         NULL,
  ADD COLUMN imagen_path      VARCHAR(255) NULL,
  ADD COLUMN dias_disponibles INT          NULL,
  ADD COLUMN certificado_id   INT          NULL,
  ADD FOREIGN KEY (certificado_id) REFERENCES certificados_plantillas(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS curso_ligero_contenido (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  curso_ligero_id INT NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  tipo            VARCHAR(30)  NOT NULL DEFAULT 'Módulo',
  orden           INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_ligero_id) REFERENCES cursos_ligeros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS curso_ligero_anuncios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  curso_ligero_id INT NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  mensaje         TEXT NULL,
  importancia     VARCHAR(20) NOT NULL DEFAULT 'Normal',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_ligero_id) REFERENCES cursos_ligeros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- progreso/tiempo_total_minutos/promedio_final/ultimo_acceso son
-- informativos — no hay plataforma de consumo real para el estudiante
-- todavía (sin eso no hay forma de medir progreso real), el Admin/Super
-- Admin los edita a mano si quiere reflejar un dato real.
CREATE TABLE IF NOT EXISTS curso_ligero_inscripciones (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  curso_ligero_id           INT NOT NULL,
  estudiante_identificacion VARCHAR(30) NOT NULL,
  progreso                  INT NOT NULL DEFAULT 0,
  tiempo_total_minutos      INT NOT NULL DEFAULT 0,
  promedio_final            DECIMAL(4,1) NULL,
  ultimo_acceso             DATE NULL,
  estado_acceso             VARCHAR(20) NOT NULL DEFAULT 'Activo',
  created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_inscripcion (curso_ligero_id, estudiante_identificacion),
  FOREIGN KEY (curso_ligero_id) REFERENCES cursos_ligeros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS curso_ligero_clases_virtuales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  curso_ligero_id INT NOT NULL,
  aula_recurso_id INT NULL,
  titulo          VARCHAR(200) NOT NULL,
  fecha_inicio    DATETIME NOT NULL,
  fecha_fin       DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_ligero_id) REFERENCES cursos_ligeros(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_recurso_id) REFERENCES aulas_recursos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 9 — Contenido real por recurso (Texto, Archivo, Video, Audio, Tarea,
-- Cuestionario, Iframe) e motor de cuestionario (preguntas + opciones), igual
-- a como se veía en Q10. Foro e Importar recursos quedan pendientes (piden
-- su propio diseño: hilos de discusión y biblioteca de recursos).
-- `curso_ligero_contenido` ya existe en producción, así que esto es un ALTER.
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE curso_ligero_contenido
  ADD COLUMN descripcion       TEXT         NULL,
  ADD COLUMN contenido_texto   TEXT         NULL,
  ADD COLUMN archivo_path      VARCHAR(255) NULL,
  ADD COLUMN url_externa       VARCHAR(500) NULL,
  ADD COLUMN como_completarlo  VARCHAR(50)  NULL,
  ADD COLUMN restringir_fecha  TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN fecha_desde       DATETIME     NULL,
  ADD COLUMN fecha_hasta       DATETIME     NULL;

CREATE TABLE IF NOT EXISTS curso_ligero_preguntas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  contenido_id    INT NOT NULL,
  texto           TEXT NOT NULL,
  tipo_respuesta  VARCHAR(10) NOT NULL DEFAULT 'unica', -- 'unica' | 'multiple'
  puntos          INT NOT NULL DEFAULT 10,
  retroalimentacion TEXT NULL,
  orden           INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contenido_id) REFERENCES curso_ligero_contenido(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS curso_ligero_opciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pregunta_id   INT NOT NULL,
  texto         TEXT NOT NULL,
  es_correcta   TINYINT(1) NOT NULL DEFAULT 0,
  orden         INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pregunta_id) REFERENCES curso_ligero_preguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════════════════
-- Fase 11 — Plantillas de educación virtual como sistema real (lista +
-- detalle Contenido/Ajustes, igual a Cursos ligeros), más 2 tipos de pregunta
-- nuevos vistos en Q10 (Asociación, Descriptiva) y la configuración real de
-- cuestionario (tiempos, intentos, aleatorio, etc). Plantillas usa sus
-- propias tablas de contenido/preguntas/opciones (no comparte fila con
-- curso_ligero_*) — cuando se construya "Importar recursos" en Cursos
-- ligeros, ese import copiará filas de aquí hacia allá, no las referenciará.
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE plantillas_educacion_virtual
  ADD COLUMN nombre VARCHAR(255) NULL AFTER id,
  ADD COLUMN imagen_path VARCHAR(255) NULL,
  ADD COLUMN publicado_por_defecto TINYINT(1) NOT NULL DEFAULT 0;

-- 'descriptiva' (11 letras) no cabía en VARCHAR(10).
ALTER TABLE curso_ligero_preguntas MODIFY tipo_respuesta VARCHAR(20) NOT NULL DEFAULT 'unica';
-- Asociación: cada opción es un par (texto = ítem izquierdo, pareja_texto =
-- definición derecha) — no tiene "correcta/incorrecta", el par ES la respuesta.
ALTER TABLE curso_ligero_opciones ADD COLUMN pareja_texto VARCHAR(255) NULL;

ALTER TABLE curso_ligero_contenido
  ADD COLUMN preguntas_por_pagina             INT        NULL,
  ADD COLUMN preguntas_aleatorias             TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN mostrar_puntaje                  TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN tiempo_maximo_min                INT        NULL,
  ADD COLUMN tiempo_minimo_min                INT        NULL,
  ADD COLUMN porcentaje_aprobacion            INT        NULL,
  ADD COLUMN intentos_disponibles             INT        NULL DEFAULT 1,
  ADD COLUMN permitir_editar_respuestas       TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN permitir_verificar_antes_enviar  TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN ver_detalle_resultados           TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN tomar_foto                       TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS plantilla_contenido (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  plantilla_id       INT NOT NULL,
  titulo             VARCHAR(255) NOT NULL,
  modulo             VARCHAR(150) NULL,
  tipo               VARCHAR(30)  NOT NULL DEFAULT 'Texto',
  orden              INT NOT NULL DEFAULT 0,
  descripcion        TEXT NULL,
  contenido_texto    TEXT NULL,
  archivo_path       VARCHAR(255) NULL,
  url_externa        VARCHAR(500) NULL,
  como_completarlo   VARCHAR(50)  NULL,
  restringir_fecha   TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_desde        DATETIME NULL,
  fecha_hasta        DATETIME NULL,
  preguntas_por_pagina             INT        NULL,
  preguntas_aleatorias             TINYINT(1) NOT NULL DEFAULT 0,
  mostrar_puntaje                  TINYINT(1) NOT NULL DEFAULT 1,
  tiempo_maximo_min                INT        NULL,
  tiempo_minimo_min                INT        NULL,
  porcentaje_aprobacion            INT        NULL,
  intentos_disponibles             INT        NULL DEFAULT 1,
  permitir_editar_respuestas       TINYINT(1) NOT NULL DEFAULT 1,
  permitir_verificar_antes_enviar  TINYINT(1) NOT NULL DEFAULT 1,
  ver_detalle_resultados           TINYINT(1) NOT NULL DEFAULT 0,
  tomar_foto                       TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plantilla_id) REFERENCES plantillas_educacion_virtual(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS plantilla_preguntas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  contenido_id      INT NOT NULL,
  texto             TEXT NOT NULL,
  tipo_respuesta    VARCHAR(20) NOT NULL DEFAULT 'unica',
  puntos            INT NOT NULL DEFAULT 10,
  retroalimentacion TEXT NULL,
  orden             INT NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contenido_id) REFERENCES plantilla_contenido(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS plantilla_opciones (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pregunta_id  INT NOT NULL,
  texto        TEXT NOT NULL,
  pareja_texto VARCHAR(255) NULL,
  es_correcta  TINYINT(1) NOT NULL DEFAULT 0,
  orden        INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pregunta_id) REFERENCES plantilla_preguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
