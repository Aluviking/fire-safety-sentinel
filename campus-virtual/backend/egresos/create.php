<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body    = json_body();
$fecha   = trim($body['fecha'] ?? '');
$concepto = trim($body['concepto'] ?? '');
$valor   = $body['valor'] ?? null;
if ($fecha === '' || $concepto === '' || $valor === null || $valor === '') {
    fail('Fecha, concepto y valor son requeridos.');
}

db()->prepare(
    'INSERT INTO egresos (fecha, concepto, tercero, valor, forma_pago, cuenta, responsable, observaciones)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([
    $fecha, $concepto, $body['tercero'] ?? null, $valor,
    $body['formaPago'] ?? null, $body['cuenta'] ?? null,
    $body['responsable'] ?? ($user['nombre'] ?? null), $body['observaciones'] ?? null,
]);

log_trace($user, 'egreso_create', "Registró un egreso de $valor ($concepto)");
respond(['ok' => true, 'egreso' => ['id' => (int) db()->lastInsertId()]]);
