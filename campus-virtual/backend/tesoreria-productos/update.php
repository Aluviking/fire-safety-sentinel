<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del producto es requerido.');

$dup = db()->prepare('SELECT id FROM tesoreria_productos WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro producto con ese nombre.');

db()->prepare('UPDATE tesoreria_productos SET nombre = ?, valor_base = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['valorBase'] ?? null, $body['estado'] ?? 'Activo', $id]);

log_trace($user, 'tesoreria_producto_update', "Editó el producto $nombre");
respond(['ok' => true]);
