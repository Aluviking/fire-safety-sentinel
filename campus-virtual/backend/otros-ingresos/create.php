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
    'INSERT INTO otros_ingresos
        (fecha, concepto, identificacion_estudiante, producto, valor, forma_pago, cuenta, periodo, responsable, observaciones)
     VALUES (?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $fecha, $concepto, $body['identificacionEstudiante'] ?? null, $body['producto'] ?? null, $valor,
    $body['formaPago'] ?? null, $body['cuenta'] ?? null, $body['periodo'] ?? null,
    $body['responsable'] ?? ($user['nombre'] ?? null), $body['observaciones'] ?? null,
]);

log_trace($user, 'otro_ingreso_create', "Registró un ingreso de $valor ($concepto)");
respond(['ok' => true, 'ingreso' => ['id' => (int) db()->lastInsertId()]]);
