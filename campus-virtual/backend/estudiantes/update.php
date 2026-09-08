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

$dup = db()->prepare('SELECT id FROM estudiantes WHERE identificacion = ? AND id != ?');
$dup->execute([$identificacion, $id]);
if ($dup->fetch()) fail('Ya existe otro estudiante con esa identificación.');

$actual = db()->prepare('SELECT identificacion FROM estudiantes WHERE id = ?');
$actual->execute([$id]);
$identificacionAnterior = $actual->fetchColumn();

db()->prepare(
    'UPDATE estudiantes SET identificacion = ?, nombre_completo = ?, genero = ?, tipo_documento = ?,
        celular = ?, correo = ?, subgrupo_sisben = ? WHERE id = ?'
)->execute([
    $identificacion, $nombreCompleto,
    $body['genero'] ?? null, $body['tipoDocumento'] ?? null,
    $body['celular'] ?? null, $body['correo'] ?? null, $body['subgrupoSisben'] ?? null,
    $id,
]);

// La cuenta de acceso (usuario=clave=identificación) queda enlazada a la
// ficha real por ese mismo dato — si se corrige la identificación aquí y no
// se actualiza también en `users`, la cuenta deja de encontrar su propia
// ficha (matrículas, asignaturas, contenido...) aunque todo lo demás esté
// bien. Se omite en silencio si la nueva identificación ya la usa otra
// cuenta, para no romper el guardado del estudiante por eso.
if ($identificacionAnterior && $identificacionAnterior !== $identificacion) {
    $dupUser = db()->prepare("SELECT id FROM users WHERE identificacion = ? AND identificacion != ?");
    $dupUser->execute([$identificacion, $identificacionAnterior]);
    if (!$dupUser->fetch()) {
        db()->prepare("UPDATE users SET identificacion = ?, username = ? WHERE identificacion = ? AND role = 'estudiante'")
            ->execute([$identificacion, $identificacion, $identificacionAnterior]);
    }
}

log_trace($user, 'estudiante_update', "Editó a $nombreCompleto");
respond(['ok' => true]);
