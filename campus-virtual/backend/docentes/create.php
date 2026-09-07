<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$identificacion = trim($body['identificacion'] ?? '');
$nombreCompleto = trim($body['nombreCompleto'] ?? '');

if ($identificacion === '' || $nombreCompleto === '') fail('Identificación y nombre completo son requeridos.');

$stmt = db()->prepare('SELECT id FROM docentes WHERE identificacion = ?');
$stmt->execute([$identificacion]);
if ($stmt->fetch()) fail('Ya existe un docente con esa identificación.');

db()->prepare(
    'INSERT INTO docentes (
        identificacion, nombre_completo, genero, tipo_documento, municipio_expedicion,
        fecha_nacimiento, municipio_nacimiento, telefono, celular, correo, direccion,
        municipio_residencia, tipo_sanguineo, escalafon, calidad_desempeno, nivel_academico,
        especialidad, fecha_ingreso, tipo_vinculacion, estado
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
    $identificacion, $nombreCompleto,
    $body['genero'] ?? null, $body['tipoDocumento'] ?? null, $body['municipioExpedicion'] ?? null,
    $body['fechaNacimiento'] ?? null, $body['municipioNacimiento'] ?? null,
    $body['telefono'] ?? null, $body['celular'] ?? null, $body['correo'] ?? null, $body['direccion'] ?? null,
    $body['municipioResidencia'] ?? null, $body['tipoSanguineo'] ?? null, $body['escalafon'] ?? null,
    $body['calidadDesempeno'] ?? null, $body['nivelAcademico'] ?? null, $body['especialidad'] ?? null,
    $body['fechaIngreso'] ?? null, $body['tipoVinculacion'] ?? null, $body['estado'] ?? 'Activo',
]);

// Cuenta de acceso automática (rol docente) — usuario y clave son siempre
// la identificación.
$cuentaCreada = crear_cuenta_acceso_automatica($identificacion, $nombreCompleto, 'docente', $body['correo'] ?? null, 'docentes.gfoacademy.local');

respond(['ok' => true, 'docente' => ['id' => (int) db()->lastInsertId(), 'identificacion' => $identificacion, 'nombreCompleto' => $nombreCompleto], 'cuentaCreada' => $cuentaCreada]);
