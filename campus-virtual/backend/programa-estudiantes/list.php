<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$programaId = (int) ($_GET['programaId'] ?? 0);
if ($programaId === 0) fail('programaId requerido.');

$stmt = db()->prepare(
    'SELECT pe.id, pe.estudiante_id, pe.estado, pe.created_at, e.identificacion, e.nombre_completo
     FROM programa_estudiantes pe
     JOIN estudiantes e ON e.id = pe.estudiante_id
     WHERE pe.programa_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$programaId]);
respond(['ok' => true, 'matriculados' => $stmt->fetchAll()]);
