<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = (int) ($_GET['asignaturaId'] ?? 0);
if ($asignaturaId === 0) fail('asignaturaId requerido.');

$stmt = db()->prepare(
    'SELECT ae.id, ae.estudiante_id, ae.estado, ae.created_at, e.identificacion, e.nombre_completo
     FROM asignatura_estudiantes ae
     JOIN estudiantes e ON e.id = ae.estudiante_id
     WHERE ae.asignatura_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'matriculados' => $stmt->fetchAll()]);
