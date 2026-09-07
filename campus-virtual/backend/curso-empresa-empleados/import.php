<?php
require __DIR__ . '/../bootstrap.php';

// El Excel se lee en el navegador (no hay librería de Excel ni en este
// backend PHP ni en el frontend hasta ahora, así que evitamos meter una
// dependencia nueva en PHP) — aquí solo llega un arreglo ya parseado de
// filas {nombres, apellidos, tipoDocumento, identificacion, celular, correo}.

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body      = json_body();
$empresaId = (int) ($body['empresaId'] ?? 0);
$filas     = $body['empleados'] ?? [];

if ($empresaId === 0) fail('empresaId requerido.');
if (!is_array($filas) || count($filas) === 0) fail('No hay filas para importar.');

$stmt = db()->prepare(
    'INSERT INTO curso_empresa_empleados (empresa_id, nombres, apellidos, tipo_documento, identificacion, celular, correo)
     VALUES (?,?,?,?,?,?,?)'
);

$insertados = 0;
$omitidos   = 0;

foreach ($filas as $fila) {
    $nombres        = trim($fila['nombres'] ?? '');
    $apellidos      = trim($fila['apellidos'] ?? '');
    $tipoDocumento  = trim($fila['tipoDocumento'] ?? '') ?: null;
    $identificacion = trim($fila['identificacion'] ?? '');
    $celular        = trim($fila['celular'] ?? '') ?: null;
    $correo         = trim($fila['correo'] ?? '') ?: null;

    if ($nombres === '' || $apellidos === '' || $identificacion === '') {
        $omitidos++;
        continue;
    }

    $stmt->execute([$empresaId, $nombres, $apellidos, $tipoDocumento, $identificacion, $celular, $correo]);
    $insertados++;
}

log_trace($user, 'curso_empresa_empleados_import', "Importó $insertados empleados a la empresa #$empresaId" . ($omitidos > 0 ? " ($omitidos filas omitidas)" : ''));

respond(['ok' => true, 'insertados' => $insertados, 'omitidos' => $omitidos]);
