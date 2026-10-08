<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

require_acceso_asignatura($user, (int) $asignaturaId);

// Un Docente solo ve lo suyo + lo institucional (creado por Admin/Super
// Admin) — nunca lo de un colega docente asignado a la misma asignatura.
// Estudiante y Admin/Super Admin ven todo, sin filtrar (mismo endpoint
// compartido por los 3).
if ($user['role'] === 'docente') {
    $stmt = db()->prepare(
        'SELECT * FROM asignatura_contenido
         WHERE asignatura_id = ? AND (creado_por_identificacion = ? OR creado_por_identificacion IS NULL)
         ORDER BY orden, id'
    );
    $stmt->execute([$asignaturaId, $user['identificacion'] ?? '']);
} else {
    $stmt = db()->prepare('SELECT * FROM asignatura_contenido WHERE asignatura_id = ? ORDER BY orden, id');
    $stmt->execute([$asignaturaId]);
}
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
