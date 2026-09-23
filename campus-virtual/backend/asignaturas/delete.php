<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Programas/Diplomados, igual
// que Super Admin (no solo lo que tiene asignado) -- pedido explicito del
// cliente, aplica a TODOS los docentes por rol, no por cuenta puntual.
require_role($user, ['super_admin', 'docente']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Asignatura no encontrada.', 404);

// programa_asignaturas se borra en cascada, y los cursos que la usaban
// quedan con asignatura_id NULL (ambos ON DELETE definidos en schema.sql).
db()->prepare('DELETE FROM asignaturas WHERE id = ?')->execute([$id]);

log_trace($user, 'asignatura_delete', "Eliminó a {$target['nombre']}");
respond(['ok' => true]);
