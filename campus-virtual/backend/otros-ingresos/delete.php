<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT concepto FROM otros_ingresos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Ingreso no encontrado.', 404);

db()->prepare('DELETE FROM otros_ingresos WHERE id = ?')->execute([$id]);

log_trace($user, 'otro_ingreso_delete', "Eliminó un ingreso ({$target['concepto']})");
respond(['ok' => true]);
