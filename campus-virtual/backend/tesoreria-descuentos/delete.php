<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM tesoreria_descuentos WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Descuento no encontrado.', 404);

db()->prepare('DELETE FROM tesoreria_descuentos WHERE id = ?')->execute([$id]);

log_trace($user, 'tesoreria_descuento_delete', "Eliminó el descuento {$target['nombre']}");
respond(['ok' => true]);
