<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del producto es requerido.');

$stmt = db()->prepare('SELECT id FROM tesoreria_productos WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un producto con ese nombre.');

db()->prepare('INSERT INTO tesoreria_productos (nombre, valor_base, estado) VALUES (?,?,?)')
    ->execute([$nombre, $body['valorBase'] ?? null, $body['estado'] ?? 'Activo']);

log_trace($user, 'tesoreria_producto_create', "Creó el producto $nombre");
respond(['ok' => true, 'producto' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
