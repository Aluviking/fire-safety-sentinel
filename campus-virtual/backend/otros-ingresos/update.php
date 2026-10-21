<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body    = json_body();
$id      = (int) ($body['id'] ?? 0);
$fecha   = trim($body['fecha'] ?? '');
$concepto = trim($body['concepto'] ?? '');
$valor   = $body['valor'] ?? null;
if ($id === 0 || $fecha === '' || $concepto === '' || $valor === null || $valor === '') {
    fail('Fecha, concepto y valor son requeridos.');
}

$current = db()->prepare('SELECT * FROM otros_ingresos WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Ingreso no encontrado.', 404);

db()->prepare(
    'UPDATE otros_ingresos SET fecha = ?, concepto = ?, identificacion_estudiante = ?, producto = ?, valor = ?,
        forma_pago = ?, cuenta = ?, periodo = ?, responsable = ?, observaciones = ? WHERE id = ?'
)->execute([
    $fecha, $concepto, $body['identificacionEstudiante'] ?? $row['identificacion_estudiante'],
    $body['producto'] ?? $row['producto'], $valor,
    $body['formaPago'] ?? $row['forma_pago'], $body['cuenta'] ?? $row['cuenta'],
    $body['periodo'] ?? $row['periodo'], $body['responsable'] ?? $row['responsable'],
    $body['observaciones'] ?? $row['observaciones'], $id,
]);

log_trace($user, 'otro_ingreso_update', "Editó un ingreso ($concepto)");
respond(['ok' => true]);
