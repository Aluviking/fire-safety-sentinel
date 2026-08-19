<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturas = db()->query('SELECT * FROM asignaturas ORDER BY nombre')->fetchAll();

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
