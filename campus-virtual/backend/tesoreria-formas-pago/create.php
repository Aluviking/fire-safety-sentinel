<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre de la forma de pago es requerido.');

$stmt = db()->prepare('SELECT id FROM tesoreria_formas_pago WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe una forma de pago con ese nombre.');

db()->prepare('INSERT INTO tesoreria_formas_pago (nombre, estado) VALUES (?,?)')
    ->execute([$nombre, $body['estado'] ?? 'Activo']);

log_trace($user, 'tesoreria_forma_pago_create', "Creó la forma de pago $nombre");
respond(['ok' => true, 'formaPago' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
