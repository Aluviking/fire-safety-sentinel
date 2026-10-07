<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Cursos ligeros, igual que
// Super Admin -- mismo pedido explicito del cliente ya aplicado en
// Programas/Asignaturas.
require_role($user, ['super_admin', 'docente']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM cursos_ligeros WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Curso ligero no encontrado.', 404);

db()->prepare('DELETE FROM cursos_ligeros WHERE id = ?')->execute([$id]);

log_trace($user, 'curso_ligero_delete', "Eliminó el curso ligero {$target['nombre']}");
respond(['ok' => true]);
