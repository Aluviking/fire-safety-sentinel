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

$dup = db()->prepare('SELECT id FROM docentes WHERE identificacion = ? AND id != ?');
$dup->execute([$identificacion, $id]);
if ($dup->fetch()) fail('Ya existe otro docente con esa identificación.');

$actual = db()->prepare('SELECT identificacion FROM docentes WHERE id = ?');
$actual->execute([$id]);
$identificacionAnterior = $actual->fetchColumn();

db()->prepare(
    'UPDATE docentes SET
        identificacion = ?, nombre_completo = ?, genero = ?, tipo_documento = ?, municipio_expedicion = ?,
        fecha_nacimiento = ?, municipio_nacimiento = ?, telefono = ?, celular = ?, correo = ?, direccion = ?,
        municipio_residencia = ?, tipo_sanguineo = ?, escalafon = ?, calidad_desempeno = ?, nivel_academico = ?,
        especialidad = ?, fecha_ingreso = ?, tipo_vinculacion = ?, estado = ?
     WHERE id = ?'
)->execute([
    $identificacion, $nombreCompleto,
    $body['genero'] ?? null, $body['tipoDocumento'] ?? null, $body['municipioExpedicion'] ?? null,
    $body['fechaNacimiento'] ?? null, $body['municipioNacimiento'] ?? null,
    $body['telefono'] ?? null, $body['celular'] ?? null, $body['correo'] ?? null, $body['direccion'] ?? null,
    $body['municipioResidencia'] ?? null, $body['tipoSanguineo'] ?? null, $body['escalafon'] ?? null,
    $body['calidadDesempeno'] ?? null, $body['nivelAcademico'] ?? null, $body['especialidad'] ?? null,
    $body['fechaIngreso'] ?? null, $body['tipoVinculacion'] ?? null, $body['estado'] ?? 'Activo',
    $id,
]);

// Misma razón que en estudiantes/update.php — la cuenta de acceso queda
// enlazada a la ficha real por la identificación; si se corrige aquí y no se
// actualiza también en `users`, la cuenta deja de encontrar su propia ficha.
if ($identificacionAnterior && $identificacionAnterior !== $identificacion) {
    $dupUser = db()->prepare("SELECT id FROM users WHERE identificacion = ? AND identificacion != ?");
    $dupUser->execute([$identificacion, $identificacionAnterior]);
    if (!$dupUser->fetch()) {
        db()->prepare("UPDATE users SET identificacion = ?, username = ? WHERE identificacion = ? AND role = 'docente'")
            ->execute([$identificacion, $identificacion, $identificacionAnterior]);
    }
}

log_trace($user, 'docente_update', "Editó a $nombreCompleto");
respond(['ok' => true]);
