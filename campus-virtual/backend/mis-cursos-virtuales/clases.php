<?php
require __DIR__ . '/../bootstrap.php';

// Las clases virtuales (con su link de Zoom y, apenas quede lista, la
// grabación) de UN curso virtual en el que el estudiante está matriculado —
// mismo candado de acceso que mis-programas/clases.php, aquí vía
// require_acceso_curso().

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

$cursoId = (int) ($_GET['cursoId'] ?? 0);
if ($cursoId === 0) fail('cursoId requerido.');

require_acceso_curso($user, $cursoId);

// es_prueba = 0: las reuniones marcadas como "de prueba" al crearlas nunca
// deben llegarle a un estudiante — mala experiencia, no son clases reales.
$stmt = db()->prepare(
    'SELECT id, titulo, fecha_inicio, fecha_fin, link_reunion, grabacion_url
     FROM curso_clases_virtuales
     WHERE curso_id = ? AND es_prueba = 0
     ORDER BY fecha_inicio'
);
$stmt->execute([$cursoId]);
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
