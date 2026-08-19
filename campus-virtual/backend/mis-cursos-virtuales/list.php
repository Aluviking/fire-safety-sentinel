<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'cursos' => [], 'vinculado' => false]);
}

// Igual que programas/asignaturas/cursos ligeros: matricular al estudiante ya
// es suficiente para que lo vea — no hace falta un paso aparte de "publicar".
$stmt = db()->prepare(
    'SELECT c.id, c.codigo_nombre, c.descripcion, c.imagen_path, c.dias_disponibles, c.docente_nombre
     FROM cursos c
     JOIN curso_estudiantes ce ON ce.curso_id = c.id
     JOIN estudiantes e ON e.id = ce.estudiante_id
     WHERE e.identificacion = ?
     ORDER BY c.codigo_nombre'
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'cursos' => $stmt->fetchAll(), 'vinculado' => true]);
