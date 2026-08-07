<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body     = json_body();
$userId   = $body['userId'] ?? '';
$nombre   = trim($body['nombre'] ?? '');
$email    = trim($body['email'] ?? '');
$username = trim($body['username'] ?? '');

if ($userId === '' || $nombre === '' || !str_contains($email, '@') || strlen($username) < 4) {
    fail('Datos inválidos.');
}

$targetStmt = db()->prepare('SELECT role FROM users WHERE id = ?');
$targetStmt->execute([$userId]);
$target = $targetStmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

// Misma regla que delete.php/update-role.php: solo un Super Admin puede
// editar a otro Admin o Super Admin.
if (in_array($target['role'], ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede editar una cuenta de Admin o Super Admin.', 403);
}

$dupStmt = db()->prepare('SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?');
$dupStmt->execute([$email, $username, $userId]);
if ($dupStmt->fetch()) fail('El correo o usuario ya está en uso por otra cuenta.');

db()->prepare('UPDATE users SET nombre = ?, email = ?, username = ? WHERE id = ?')
    ->execute([$nombre, $email, $username, $userId]);

log_trace($user, 'user_update', null, "Editó datos de $nombre");
respond(['ok' => true]);
