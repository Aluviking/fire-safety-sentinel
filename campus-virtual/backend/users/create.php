<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$ROLES = ['super_admin', 'admin', 'docente', 'administrativo', 'estudiante', 'equipo'];

$body           = json_body();
$nombre         = trim($body['nombre'] ?? '');
$email          = trim($body['email'] ?? '');
$username       = trim($body['username'] ?? '');
$password       = $body['password'] ?? '';
$role           = $body['role'] ?? 'estudiante';
$identificacion = trim($body['identificacion'] ?? '');

if ($nombre === '' || !str_contains($email, '@') || strlen($username) < 4 || strlen($password) < 6) {
    fail('Datos inválidos.');
}
if (!in_array($role, $ROLES, true)) fail('Rol inválido.');

// Solo un Super Admin puede crear usuarios con rol Admin o Super Admin.
if (in_array($role, ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede crear usuarios con rol Admin o Super Admin.', 403);
}

// La identificación es lo que conecta esta cuenta con la ficha real del
// estudiante/docente (matrículas, cursos, notas, cursos asignados).
if (($role === 'estudiante' || $role === 'docente') && $identificacion === '') {
    fail('La identificación es requerida para crear un usuario con rol Estudiante o Docente.');
}

$stmt = db()->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) fail('El correo o usuario ya existe.');

if ($identificacion !== '') {
    $stmt = db()->prepare('SELECT id FROM users WHERE identificacion = ?');
    $stmt->execute([$identificacion]);
    if ($stmt->fetch()) fail('Ya existe un usuario con esa identificación.');
}

$id   = new_id('usr');
$hash = password_hash($password, PASSWORD_DEFAULT);

db()->prepare(
    'INSERT INTO users (id, nombre, email, username, password_hash, role, identificacion) VALUES (?,?,?,?,?,?,?)'
)->execute([$id, $nombre, $email, $username, $hash, $role, $identificacion !== '' ? $identificacion : null]);

if ($role === 'estudiante' && $identificacion !== '') {
    vincular_estudiante($identificacion, $nombre);
} elseif ($role === 'docente' && $identificacion !== '') {
    vincular_docente($identificacion, $nombre);
}

respond(['ok' => true, 'user' => [
    'id' => $id, 'nombre' => $nombre, 'email' => $email, 'username' => $username, 'role' => $role,
    'identificacion' => $identificacion !== '' ? $identificacion : null,
]]);
