<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId   = $_GET['programaId'] ?? '';
$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($programaId === '' || $asignaturaId === '') fail('programaId y asignaturaId son requeridos.');

$stmt = db()->prepare(
    'SELECT pap.id, pap.prerequisito_asignatura_id, a.nombre AS prerequisito_nombre
     FROM programa_asignatura_prerequisitos pap
     JOIN asignaturas a ON a.id = pap.prerequisito_asignatura_id
     WHERE pap.programa_id = ? AND pap.asignatura_id = ?
     ORDER BY a.nombre'
);
$stmt->execute([$programaId, $asignaturaId]);
respond(['ok' => true, 'prerequisitos' => $stmt->fetchAll()]);
