<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body     = json_body();
$userId   = $body['userId'] ?? '';
$nombre   = trim($body['nombre'] ?? '');
$email    = trim($body['email'] ?? '');
$username = trim($body['username'] ?? '');

if ($userId === '' || $nombre === '' || !str_contains($email, '@') || strlen($username) < 4) {
    fail('Datos inválidos.');
}

$targetStmt = db()->prepare('SELECT id FROM users WHERE id = ?');
$targetStmt->execute([$userId]);
if (!$targetStmt->fetch()) fail('Usuario no encontrado.', 404);

$dupStmt = db()->prepare('SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?');
$dupStmt->execute([$email, $username, $userId]);
if ($dupStmt->fetch()) fail('El correo o usuario ya está en uso por otra cuenta.');

db()->prepare('UPDATE users SET nombre = ?, email = ?, username = ? WHERE id = ?')
    ->execute([$nombre, $email, $username, $userId]);

log_trace($user, 'user_update', "Editó datos de $nombre");
respond(['ok' => true]);
