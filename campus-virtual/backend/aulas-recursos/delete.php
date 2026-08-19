<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM aulas_recursos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Aula no encontrada.', 404);

db()->prepare('DELETE FROM aulas_recursos WHERE id = ?')->execute([$id]);

log_trace($user, 'aula_recurso_delete', "Eliminó el aula {$target['nombre']}");
respond(['ok' => true]);
