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

$current = db()->prepare('SELECT * FROM egresos WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Egreso no encontrado.', 404);

db()->prepare(
    'UPDATE egresos SET fecha = ?, concepto = ?, tercero = ?, valor = ?, forma_pago = ?, cuenta = ?,
        responsable = ?, observaciones = ? WHERE id = ?'
)->execute([
    $fecha, $concepto, $body['tercero'] ?? $row['tercero'], $valor,
    $body['formaPago'] ?? $row['forma_pago'], $body['cuenta'] ?? $row['cuenta'],
    $body['responsable'] ?? $row['responsable'], $body['observaciones'] ?? $row['observaciones'], $id,
]);

log_trace($user, 'egreso_update', "Editó un egreso ($concepto)");
respond(['ok' => true]);
