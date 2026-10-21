<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT concepto FROM egresos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Egreso no encontrado.', 404);

db()->prepare('DELETE FROM egresos WHERE id = ?')->execute([$id]);

log_trace($user, 'egreso_delete', "Eliminó un egreso ({$target['concepto']})");
respond(['ok' => true]);
