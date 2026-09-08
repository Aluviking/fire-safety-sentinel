<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

// "Matriculados" cuenta estudiantes reales vía el pensum (programa_asignaturas
// + matriculas) — ya no vía asignatura_estudiantes, que se quedó sin UI desde
// que el contenido de asignaturas pasó a administrarse solo desde el pensum.
$asignaturas = db()->query(
    "SELECT a.*, (
        SELECT COUNT(DISTINCT e.id)
        FROM programa_asignaturas pa
        JOIN programas p ON p.id = pa.programa_id
        JOIN matriculas m ON (m.programa = p.nombre OR m.programa LIKE CONCAT(p.nombre, ' - %')) AND m.estado != 'CANCELADO'
        JOIN estudiantes e ON e.id = m.estudiante_id
        WHERE pa.asignatura_id = a.id
     ) AS matriculados
     FROM asignaturas a
     ORDER BY a.nombre"
)->fetchAll();

$pares = db()->query(
    'SELECT pa.asignatura_id, p.id AS programa_id, p.nombre AS programa_nombre
     FROM programa_asignaturas pa JOIN programas p ON p.id = pa.programa_id'
)->fetchAll();
$byAsignatura = [];
foreach ($pares as $p) {
    $byAsignatura[$p['asignatura_id']][] = ['id' => $p['programa_id'], 'nombre' => $p['programa_nombre']];
}

foreach ($asignaturas as &$a) {
    $a['programas'] = $byAsignatura[$a['id']] ?? [];
}
unset($a);

respond(['ok' => true, 'asignaturas' => $asignaturas]);
