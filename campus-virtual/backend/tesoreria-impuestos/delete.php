<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM tesoreria_impuestos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Impuesto no encontrado.', 404);

db()->prepare('DELETE FROM tesoreria_impuestos WHERE id = ?')->execute([$id]);

log_trace($user, 'tesoreria_impuesto_delete', "Eliminó el impuesto {$target['nombre']}");
respond(['ok' => true]);
