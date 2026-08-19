<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'programas' => [], 'vinculado' => false]);
}

// Igual que cursos ligeros: matricular al estudiante ya es suficiente para
// que lo vea — no hace falta un paso aparte de "publicar".
$stmt = db()->prepare(
    'SELECT p.id, p.nombre, p.descripcion, p.imagen_path, p.dias_disponibles
     FROM programas p
     JOIN programa_estudiantes pe ON pe.programa_id = p.id
     JOIN estudiantes e ON e.id = pe.estudiante_id
     WHERE e.identificacion = ?
     ORDER BY p.nombre'
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'programas' => $stmt->fetchAll(), 'vinculado' => true]);
