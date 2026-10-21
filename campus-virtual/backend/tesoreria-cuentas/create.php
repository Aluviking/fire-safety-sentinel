<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre de la cuenta es requerido.');

$stmt = db()->prepare('SELECT id FROM tesoreria_cuentas WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe una cuenta con ese nombre.');

db()->prepare('INSERT INTO tesoreria_cuentas (nombre, codigo, estado) VALUES (?,?,?)')
    ->execute([$nombre, $body['codigo'] ?? null, $body['estado'] ?? 'Activo']);

log_trace($user, 'tesoreria_cuenta_create', "Creó la cuenta $nombre");
respond(['ok' => true, 'cuenta' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
