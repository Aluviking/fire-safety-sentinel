<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Un docente solo puede borrar sus propias asignaturas -- mismo candado
// que update.php. Admin/Super Admin siempre pasan.
require_role($user, ['super_admin', 'docente']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

require_gestion_asignatura($user, $id);

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Asignatura no encontrada.', 404);

// programa_asignaturas se borra en cascada, y los cursos que la usaban
// quedan con asignatura_id NULL (ambos ON DELETE definidos en schema.sql).
db()->prepare('DELETE FROM asignaturas WHERE id = ?')->execute([$id]);

log_trace($user, 'asignatura_delete', "Eliminó a {$target['nombre']}");
respond(['ok' => true]);
