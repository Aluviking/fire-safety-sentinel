<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Programa no encontrado.', 404);

// Los cursos que lo usaban quedan con programa_id NULL (ON DELETE SET NULL en
// schema.sql) — no se bloquea el borrado, pero el frontend advierte de esto
// antes de confirmar.
db()->prepare('DELETE FROM programas WHERE id = ?')->execute([$id]);

log_trace($user, 'programa_delete', "Eliminó a {$target['nombre']}");
respond(['ok' => true]);
