<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre de la cuenta es requerido.');

$dup = db()->prepare('SELECT id FROM tesoreria_cuentas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra cuenta con ese nombre.');

db()->prepare('UPDATE tesoreria_cuentas SET nombre = ?, codigo = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['codigo'] ?? null, $body['estado'] ?? 'Activo', $id]);

log_trace($user, 'tesoreria_cuenta_update', "Editó la cuenta $nombre");
respond(['ok' => true]);
