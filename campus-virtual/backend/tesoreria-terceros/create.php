<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body            = json_body();
$numeroDocumento = trim($body['numeroDocumento'] ?? '');
$nombre          = trim($body['nombre'] ?? '');
if ($numeroDocumento === '' || $nombre === '') fail('Documento y nombre son requeridos.');

$stmt = db()->prepare('SELECT id FROM tesoreria_terceros WHERE numero_documento = ?');
$stmt->execute([$numeroDocumento]);
if ($stmt->fetch()) fail('Ya existe un tercero con ese documento.');

db()->prepare(
    'INSERT INTO tesoreria_terceros (tipo_documento, numero_documento, nombre, telefono, correo, estado) VALUES (?,?,?,?,?,?)'
)->execute([
    $body['tipoDocumento'] ?? null, $numeroDocumento, $nombre,
    $body['telefono'] ?? null, $body['correo'] ?? null, $body['estado'] ?? 'Activo',
]);

log_trace($user, 'tesoreria_tercero_create', "Creó el tercero $nombre");
respond(['ok' => true, 'tercero' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
