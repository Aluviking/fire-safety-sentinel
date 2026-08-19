<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'estudiante') fail('No autorizado.', 403);

// Cuenta sin identificación vinculada todavía (creada antes de este cambio,
// o pendiente de que un Super Admin la complete desde Usuarios).
if (empty($user['identificacion'])) {
    respond(['ok' => true, 'cursos' => [], 'vinculado' => false]);
}

$stmt = db()->prepare(
    'SELECT c.id, c.nombre, c.categoria, c.descripcion, c.imagen_path, c.docente_nombre,
         i.progreso, i.estado_acceso
     FROM cursos_ligeros c
     JOIN curso_ligero_inscripciones i ON i.curso_ligero_id = c.id
     WHERE i.estudiante_identificacion = ?
     ORDER BY c.nombre'
);
$stmt->execute([$user['identificacion']]);
respond(['ok' => true, 'cursos' => $stmt->fetchAll(), 'vinculado' => true]);
