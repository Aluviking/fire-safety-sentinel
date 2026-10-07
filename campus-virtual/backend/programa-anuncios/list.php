<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

// Se agregan también los anuncios publicados directamente en una asignatura
// del pensum de este programa (tabla aparte, asignatura_anuncios) — mismo
// motivo que programa-clases/list.php. `origen_api_base`/`origen_nombre` le
// dicen al front de dónde viene cada fila, para poder borrarla desde el
// endpoint correcto y mostrar su asignatura de origen.
$stmt = db()->prepare(
    "(SELECT id, titulo, mensaje, importancia, created_at, NULL AS origen_nombre, NULL AS origen_api_base
      FROM programa_anuncios WHERE programa_id = ?)
     UNION ALL
     (SELECT a.id, a.titulo, a.mensaje, a.importancia, a.created_at, asg.nombre AS origen_nombre, '/asignatura-anuncios' AS origen_api_base
      FROM asignatura_anuncios a
      JOIN programa_asignaturas pa ON pa.asignatura_id = a.asignatura_id
      JOIN asignaturas asg ON asg.id = a.asignatura_id
      WHERE pa.programa_id = ?)
     ORDER BY created_at DESC"
);
$stmt->execute([$programaId, $programaId]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
