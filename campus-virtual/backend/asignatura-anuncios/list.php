<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

// Un Docente solo ve sus propios anuncios + los institucionales (Admin/Super
// Admin) — nunca los de un colega docente asignado a la misma asignatura.
if ($user['role'] === 'docente') {
    $stmt = db()->prepare(
        'SELECT * FROM asignatura_anuncios
         WHERE asignatura_id = ? AND (creado_por_identificacion = ? OR creado_por_identificacion IS NULL)
         ORDER BY created_at DESC'
    );
    $stmt->execute([$asignaturaId, $user['identificacion'] ?? '']);
} else {
    $stmt = db()->prepare('SELECT * FROM asignatura_anuncios WHERE asignatura_id = ? ORDER BY created_at DESC');
    $stmt->execute([$asignaturaId]);
}
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
