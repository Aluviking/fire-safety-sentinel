<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre de la forma de pago es requerido.');

$dup = db()->prepare('SELECT id FROM tesoreria_formas_pago WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra forma de pago con ese nombre.');

db()->prepare('UPDATE tesoreria_formas_pago SET nombre = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['estado'] ?? 'Activo', $id]);

log_trace($user, 'tesoreria_forma_pago_update', "Editó la forma de pago $nombre");
respond(['ok' => true]);
