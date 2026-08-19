<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'asignaturas' => [], 'vinculado' => false]);
}

// Igual que cursos ligeros: matricular al estudiante ya es suficiente para
// que lo vea — no hace falta un paso aparte de "publicar".
$stmt = db()->prepare(
    'SELECT a.id, a.nombre, a.descripcion, a.imagen_path, a.dias_disponibles
     FROM asignaturas a
     JOIN asignatura_estudiantes ae ON ae.asignatura_id = a.id
     JOIN estudiantes e ON e.id = ae.estudiante_id
     WHERE e.identificacion = ?
     ORDER BY a.nombre'
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'asignaturas' => $stmt->fetchAll(), 'vinculado' => true]);
