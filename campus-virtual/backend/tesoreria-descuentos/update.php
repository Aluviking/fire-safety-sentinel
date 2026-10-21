<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del descuento es requerido.');

$dup = db()->prepare('SELECT id FROM tesoreria_descuentos WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro descuento con ese nombre.');

db()->prepare('UPDATE tesoreria_descuentos SET nombre = ?, tipo = ?, valor = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['tipo'] ?? 'Porcentaje', $body['valor'] ?? null, $body['estado'] ?? 'Activo', $id]);

log_trace($user, 'tesoreria_descuento_update', "Editó el descuento $nombre");
respond(['ok' => true]);
