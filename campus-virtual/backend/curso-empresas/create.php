<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$programaId  = (int) ($body['programaId'] ?? 0);
$nit         = trim($body['nit'] ?? '');
$razonSocial = trim($body['razonSocial'] ?? '');
$correo      = trim($body['correo'] ?? '') ?: null;
$celular     = trim($body['celular'] ?? '') ?: null;
$cantidad    = $body['cantidadEmpleados'] ?? null;

if ($programaId === 0 || $nit === '' || $razonSocial === '') {
    fail('NIT y razón social son requeridos.');
}

db()->prepare(
    'INSERT INTO curso_empresas (programa_id, nit, razon_social, correo, celular, cantidad_empleados) VALUES (?,?,?,?,?,?)'
)->execute([$programaId, $nit, $razonSocial, $correo, $celular, $cantidad !== null && $cantidad !== '' ? (int) $cantidad : null]);

$id = (int) db()->lastInsertId();
log_trace($user, 'curso_empresa_create', "Creó la empresa \"$razonSocial\" (NIT $nit)");

respond(['ok' => true, 'id' => $id]);
