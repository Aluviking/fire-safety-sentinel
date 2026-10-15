<?php
require __DIR__ . '/../bootstrap.php';

// Las clases virtuales (con su link de Zoom y, apenas quede lista, la
// grabación) de UN programa/curso/diplomado en el que el estudiante está
// matriculado — mismo candado de acceso que mis-programas/asignaturas.php.
// No se reutiliza programa-clases/list.php porque ese exige permiso de
// módulo administrativo (academico.programas), que un estudiante nunca
// tiene — aquí se valida por matrícula real en su lugar.

$user = require_auth();
if ($user['role'] !== 'estudiante' && $user['role'] !== 'docente') fail('No autorizado.', 403);

$programaId = (int) ($_GET['programaId'] ?? 0);
if ($programaId === 0) fail('programaId requerido.');

require_acceso_programa($user, $programaId);

// Se agregan también las clases creadas directamente en una asignatura del
// pensum de este programa (tabla aparte, asignatura_clases_virtuales) —
// mismo motivo que programa-clases/list.php del lado admin: una clase
// programada desde una asignatura puntual parecía no existir al ver el
// programa que la contiene. `origen`/`origen_nombre` le dicen al front de
// dónde viene cada fila, para poder organizarlas por asignatura.
// es_prueba = 0: las reuniones marcadas como "de prueba" al crearlas nunca
// deben llegarle (ni a estudiante ni a este resumen de docente) — mala
// experiencia, no son clases reales. Para Docente, además, solo las de SUS
// propias asignaturas dentro de este programa (mismo candado que ya usa
// mis-programas/asignaturas.php).
$filtroDocente = $user['role'] === 'docente' ? ' AND EXISTS (
    SELECT 1 FROM asignatura_docentes ad JOIN docentes d ON d.id = ad.docente_id
    WHERE ad.asignatura_id = asg.id AND d.identificacion = ?
  )' : '';
$paramsAsignatura = $user['role'] === 'docente' ? [$programaId, $user['identificacion'] ?? ''] : [$programaId];

$stmt = db()->prepare(
    "(SELECT 'Programa' AS origen, p.nombre AS origen_nombre, c.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url, c.grabacion_password
      FROM programa_clases_virtuales c JOIN programas p ON p.id = c.programa_id
      WHERE c.programa_id = ? AND c.es_prueba = 0)
     UNION ALL
     (SELECT 'Asignatura', asg.nombre, c.id, c.titulo, c.fecha_inicio, c.fecha_fin, c.link_reunion, c.grabacion_url, c.grabacion_password
      FROM asignatura_clases_virtuales c JOIN asignaturas asg ON asg.id = c.asignatura_id
      JOIN programa_asignaturas pa ON pa.asignatura_id = asg.id
      WHERE pa.programa_id = ? AND c.es_prueba = 0{$filtroDocente})
     ORDER BY fecha_inicio"
);
$stmt->execute([$programaId, ...$paramsAsignatura]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
