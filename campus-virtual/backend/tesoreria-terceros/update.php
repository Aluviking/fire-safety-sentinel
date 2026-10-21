<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body            = json_body();
$id              = (int) ($body['id'] ?? 0);
$numeroDocumento = trim($body['numeroDocumento'] ?? '');
$nombre          = trim($body['nombre'] ?? '');
if ($id === 0 || $numeroDocumento === '' || $nombre === '') fail('Documento y nombre son requeridos.');

$dup = db()->prepare('SELECT id FROM tesoreria_terceros WHERE numero_documento = ? AND id != ?');
$dup->execute([$numeroDocumento, $id]);
if ($dup->fetch()) fail('Ya existe otro tercero con ese documento.');

db()->prepare(
    'UPDATE tesoreria_terceros SET tipo_documento = ?, numero_documento = ?, nombre = ?, telefono = ?, correo = ?, estado = ? WHERE id = ?'
)->execute([
    $body['tipoDocumento'] ?? null, $numeroDocumento, $nombre,
    $body['telefono'] ?? null, $body['correo'] ?? null, $body['estado'] ?? 'Activo', $id,
]);

log_trace($user, 'tesoreria_tercero_update', "Editó el tercero $nombre");
respond(['ok' => true]);
