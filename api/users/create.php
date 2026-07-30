<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body      = json_body();
$nombre    = trim($body['nombre'] ?? '');
$email     = trim($body['email'] ?? '');
$username  = trim($body['username'] ?? '');
$password  = $body['password'] ?? '';
$role      = $body['role'] ?? 'cliente';
$empresaId = $body['empresaId'] ?? null;

if ($nombre === '' || !str_contains($email, '@') || strlen($username) < 4 || strlen($password) < 6) {
    fail('Datos inválidos.');
}
if (!in_array($role, ['super_admin', 'admin', 'equipo', 'cliente'], true)) fail('Rol inválido.');

// Misma regla que users/update-role.php: solo un Super Admin puede crear
// usuarios con rol Admin o Super Admin. Un Admin normal solo puede crear
// usuarios de Equipo o Cliente.
if (in_array($role, ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede crear usuarios con rol Admin o Super Admin.', 403);
}

$stmt = db()->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) fail('El correo o usuario ya existe.');

$id       = new_id('user');
$hash     = password_hash($password, PASSWORD_DEFAULT);
$finalEmp = $role === 'cliente' ? $empresaId : null;

db()->prepare(
    'INSERT INTO users (id, nombre, email, username, password_hash, role, empresa_id) VALUES (?,?,?,?,?,?,?)'
)->execute([$id, $nombre, $email, $username, $hash, $role, $finalEmp]);

log_trace($user, 'user_create', $finalEmp, "Creó a $nombre como $role");

respond(['ok' => true, 'user' => [
    'id' => $id, 'nombre' => $nombre, 'email' => $email, 'username' => $username,
    'role' => $role, 'empresa_id' => $finalEmp,
]]);
