<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

// Un Docente solo ve sus propias clases + las institucionales (Admin/Super
// Admin) — nunca las de un colega docente asignado a la misma asignatura.
if ($user['role'] === 'docente') {
    $stmt = db()->prepare(
        'SELECT c.*, a.nombre AS aula_nombre
         FROM asignatura_clases_virtuales c
         LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
         WHERE c.asignatura_id = ? AND c.archivado = 0
           AND (c.creado_por_identificacion = ? OR c.creado_por_identificacion IS NULL)
         ORDER BY c.fecha_inicio'
    );
    $stmt->execute([$asignaturaId, $user['identificacion'] ?? '']);
} else {
    $stmt = db()->prepare(
        'SELECT c.*, a.nombre AS aula_nombre
         FROM asignatura_clases_virtuales c
         LEFT JOIN aulas_recursos a ON a.id = c.aula_recurso_id
         WHERE c.asignatura_id = ? AND c.archivado = 0
         ORDER BY c.fecha_inicio'
    );
    $stmt->execute([$asignaturaId]);
}
respond(['ok' => true, 'clases' => $stmt->fetchAll()]);
