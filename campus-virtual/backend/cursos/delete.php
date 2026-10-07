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

$stmt = db()->prepare('SELECT codigo_nombre FROM cursos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Curso no encontrado.', 404);

db()->prepare('DELETE FROM cursos WHERE id = ?')->execute([$id]);

log_trace($user, 'curso_delete', "Eliminó a {$target['codigo_nombre']}");
respond(['ok' => true]);
