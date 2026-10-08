<?php
require __DIR__ . '/../bootstrap.php';

// Las clases virtuales (con su link de Zoom y, apenas quede lista, la
// grabación) de UNA asignatura en la que el estudiante está matriculado —
// mismo candado de acceso que mis-programas/clases.php, aquí vía
// require_acceso_asignatura().

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

$asignaturaId = (int) ($_GET['asignaturaId'] ?? 0);
if ($asignaturaId === 0) fail('asignaturaId requerido.');

require_acceso_asignatura($user, $asignaturaId);

// es_prueba = 0: las reuniones marcadas como "de prueba" al crearlas nunca
// deben llegarle a un estudiante — mala experiencia, no son clases reales.
$stmt = db()->prepare(
    'SELECT id, titulo, fecha_inicio, fecha_fin, link_reunion, grabacion_url
     FROM asignatura_clases_virtuales
     WHERE asignatura_id = ? AND es_prueba = 0
     ORDER BY fecha_inicio'
);
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
