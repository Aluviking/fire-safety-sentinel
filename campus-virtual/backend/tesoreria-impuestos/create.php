<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del impuesto es requerido.');

$stmt = db()->prepare('SELECT id FROM tesoreria_impuestos WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un impuesto con ese nombre.');

db()->prepare('INSERT INTO tesoreria_impuestos (nombre, porcentaje, estado) VALUES (?,?,?)')
    ->execute([$nombre, $body['porcentaje'] ?? null, $body['estado'] ?? 'Activo']);

log_trace($user, 'tesoreria_impuesto_create', "Creó el impuesto $nombre");
respond(['ok' => true, 'impuesto' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
