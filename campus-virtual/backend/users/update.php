<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body           = json_body();
$userId         = $body['userId'] ?? '';
$nombre         = trim($body['nombre'] ?? '');
$email          = trim($body['email'] ?? '');
$username       = trim($body['username'] ?? '');
$identificacion = trim($body['identificacion'] ?? '');

if ($userId === '' || $nombre === '' || !str_contains($email, '@') || strlen($username) < 4) {
    fail('Datos inválidos.');
}

$targetStmt = db()->prepare('SELECT id, role FROM users WHERE id = ?');
$targetStmt->execute([$userId]);
$target = $targetStmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

if (($target['role'] === 'estudiante' || $target['role'] === 'docente') && $identificacion === '') {
    fail('La identificación es requerida para un usuario con rol Estudiante o Docente.');
}

$dupStmt = db()->prepare('SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?');
$dupStmt->execute([$email, $username, $userId]);
if ($dupStmt->fetch()) fail('El correo o usuario ya está en uso por otra cuenta.');

if ($identificacion !== '') {
    $dupIdStmt = db()->prepare('SELECT id FROM users WHERE identificacion = ? AND id != ?');
    $dupIdStmt->execute([$identificacion, $userId]);
    if ($dupIdStmt->fetch()) fail('Ya existe otro usuario con esa identificación.');
}

db()->prepare('UPDATE users SET nombre = ?, email = ?, username = ?, identificacion = ? WHERE id = ?')
    ->execute([$nombre, $email, $username, $identificacion !== '' ? $identificacion : null, $userId]);

if ($target['role'] === 'estudiante' && $identificacion !== '') {
    vincular_estudiante($identificacion, $nombre);
} elseif ($target['role'] === 'docente' && $identificacion !== '') {
    vincular_docente($identificacion, $nombre);
}

log_trace($user, 'user_update', "Editó datos de $nombre");
respond(['ok' => true]);
