<?php
require __DIR__ . '/../bootstrap.php';

// Carga masiva de pagos realizados vía CSV -- mismas columnas que ya tiene
// la tabla `pagos_realizados` (histórico de Q10), para que lo importado acá
// se vea exactamente igual en el módulo Pagos, sin tabla aparte.
// Encabezados esperados (en ese orden, con coma como separador):
// identificacion,comprobante,fecha_pago,fecha_asiento,cajero,producto,
// periodo,valor_pagado,cuenta,forma_pago,valor_forma_pago,estado

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Sube un archivo CSV válido.');

$maxBytes = 5 * 1024 * 1024;
if ($_FILES['file']['size'] > $maxBytes) fail('El archivo supera el límite de 5MB.');

$ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
if ($ext !== 'csv') fail('El archivo debe ser .csv.');

$columnasEsperadas = [
    'identificacion', 'comprobante', 'fecha_pago', 'fecha_asiento', 'cajero', 'producto',
    'periodo', 'valor_pagado', 'cuenta', 'forma_pago', 'valor_forma_pago', 'estado',
];

$handle = fopen($_FILES['file']['tmp_name'], 'r');
if (!$handle) fail('No se pudo leer el archivo.');

$encabezado = fgetcsv($handle);
if (!$encabezado) { fclose($handle); fail('El archivo está vacío.'); }
$encabezado = array_map(static fn($h) => strtolower(trim((string) $h)), $encabezado);
if ($encabezado !== $columnasEsperadas) {
    fclose($handle);
    fail('El encabezado del CSV no coincide. Debe ser exactamente: ' . implode(',', $columnasEsperadas));
}

$insert = db()->prepare(
    'INSERT INTO pagos_realizados
        (identificacion, comprobante, fecha_pago, fecha_asiento, cajero, producto,
         periodo, valor_pagado, cuenta, forma_pago, valor_forma_pago, estado)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
);

$insertados = 0;
$errores = [];
$fila = 1;
while (($datos = fgetcsv($handle)) !== false) {
    $fila++;
    if (count($datos) === 1 && trim((string) $datos[0]) === '') continue; // línea vacía
    if (count($datos) !== count($columnasEsperadas)) {
        $errores[] = "Fila $fila: número de columnas no coincide.";
        continue;
    }
    [$identificacion, $comprobante, $fechaPago, $fechaAsiento, $cajero, $producto,
     $periodo, $valorPagado, $cuenta, $formaPago, $valorFormaPago, $estado] = $datos;

    if (trim($identificacion) === '' || trim($valorPagado) === '') {
        $errores[] = "Fila $fila: identificación y valor pagado son requeridos.";
        continue;
    }

    $insert->execute([
        trim($identificacion), trim($comprobante) ?: null, trim($fechaPago) ?: null, trim($fechaAsiento) ?: null,
        trim($cajero) ?: null, trim($producto) ?: null, trim($periodo) ?: null, trim($valorPagado),
        trim($cuenta) ?: null, trim($formaPago) ?: null, trim($valorFormaPago) ?: null, trim($estado) ?: null,
    ]);
    $insertados++;
}
fclose($handle);

log_trace($user, 'importar_pagos', "Importó $insertados pagos desde CSV" . (count($errores) ? (' (' . count($errores) . ' filas con error)') : ''));
respond(['ok' => true, 'insertados' => $insertados, 'errores' => $errores]);
