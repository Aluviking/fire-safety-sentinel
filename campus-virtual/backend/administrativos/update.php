<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$id             = (int) ($body['id'] ?? 0);
$identificacion = trim($body['identificacion'] ?? '');
$nombreCompleto = trim($body['nombreCompleto'] ?? '');

if ($id === 0 || $identificacion === '' || $nombreCompleto === '') {
    fail('Identificación y nombre completo son requeridos.');
}

$dup = db()->prepare('SELECT id FROM administrativos WHERE identificacion = ? AND id != ?');
$dup->execute([$identificacion, $id]);
if ($dup->fetch()) fail('Ya existe otro administrativo con esa identificación.');

db()->prepare(
    'UPDATE administrativos SET
        identificacion = ?, nombre_completo = ?, genero = ?, tipo_documento = ?, municipio_expedicion = ?,
        fecha_nacimiento = ?, municipio_nacimiento = ?, telefono = ?, celular = ?, correo = ?, direccion = ?,
        municipio_residencia = ?, tipo_sanguineo = ?, cargo = ?, escalafon = ?, calidad_desempeno = ?,
        nivel_academico = ?, especialidad = ?, fecha_ingreso = ?, tipo_vinculacion = ?, estado = ?
     WHERE id = ?'
)->execute([
    $identificacion, $nombreCompleto,
    $body['genero'] ?? null, $body['tipoDocumento'] ?? null, $body['municipioExpedicion'] ?? null,
    $body['fechaNacimiento'] ?? null, $body['municipioNacimiento'] ?? null,
    $body['telefono'] ?? null, $body['celular'] ?? null, $body['correo'] ?? null, $body['direccion'] ?? null,
    $body['municipioResidencia'] ?? null, $body['tipoSanguineo'] ?? null, $body['cargo'] ?? null,
    $body['escalafon'] ?? null, $body['calidadDesempeno'] ?? null, $body['nivelAcademico'] ?? null,
    $body['especialidad'] ?? null, $body['fechaIngreso'] ?? null, $body['tipoVinculacion'] ?? null,
    $body['estado'] ?? 'Activo',
    $id,
]);

log_trace($user, 'administrativo_update', "Editó a $nombreCompleto");
respond(['ok' => true]);
