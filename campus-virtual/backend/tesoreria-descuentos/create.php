<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del descuento es requerido.');

$stmt = db()->prepare('SELECT id FROM tesoreria_descuentos WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un descuento con ese nombre.');

db()->prepare('INSERT INTO tesoreria_descuentos (nombre, tipo, valor, estado) VALUES (?,?,?,?)')
    ->execute([$nombre, $body['tipo'] ?? 'Porcentaje', $body['valor'] ?? null, $body['estado'] ?? 'Activo']);

log_trace($user, 'tesoreria_descuento_create', "Creó el descuento $nombre");
respond(['ok' => true, 'descuento' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
