<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$empresaId      = (int) ($body['empresaId'] ?? 0);
$nombres        = trim($body['nombres'] ?? '');
$apellidos      = trim($body['apellidos'] ?? '');
$tipoDocumento  = trim($body['tipoDocumento'] ?? '') ?: null;
$identificacion = trim($body['identificacion'] ?? '');
$celular        = trim($body['celular'] ?? '') ?: null;
$correo         = trim($body['correo'] ?? '') ?: null;

if ($empresaId === 0 || $nombres === '' || $apellidos === '' || $identificacion === '') {
    fail('Nombres, apellidos e identificación son requeridos.');
}

db()->prepare(
    'INSERT INTO curso_empresa_empleados (empresa_id, nombres, apellidos, tipo_documento, identificacion, celular, correo)
     VALUES (?,?,?,?,?,?,?)'
)->execute([$empresaId, $nombres, $apellidos, $tipoDocumento, $identificacion, $celular, $correo]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
