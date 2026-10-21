<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del impuesto es requerido.');

$dup = db()->prepare('SELECT id FROM tesoreria_impuestos WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro impuesto con ese nombre.');

db()->prepare('UPDATE tesoreria_impuestos SET nombre = ?, porcentaje = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['porcentaje'] ?? null, $body['estado'] ?? 'Activo', $id]);

log_trace($user, 'tesoreria_impuesto_update', "Editó el impuesto $nombre");
respond(['ok' => true]);
