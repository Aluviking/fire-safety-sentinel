<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = $_GET['programaId'] ?? '';
if ($programaId === '') fail('programaId requerido.');

$stmt = db()->prepare(
    'SELECT pa.*, a.codigo AS asignatura_codigo, a.nombre AS asignatura_nombre
     FROM programa_asignaturas pa
     JOIN asignaturas a ON a.id = pa.asignatura_id
     WHERE pa.programa_id = ?
     ORDER BY pa.orden, pa.id'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'asignaturas' => $stmt->fetchAll()]);
