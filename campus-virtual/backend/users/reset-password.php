<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body        = json_body();
$userId      = $body['userId'] ?? '';
$newPassword = $body['newPassword'] ?? '';

if ($userId === '' || strlen($newPassword) < 6) fail('La contraseña debe tener al menos 6 caracteres.');

$targetStmt = db()->prepare('SELECT nombre FROM users WHERE id = ?');
$targetStmt->execute([$userId]);
$target = $targetStmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

$hash = password_hash($newPassword, PASSWORD_DEFAULT);
db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $userId]);

// Invalida las sesiones activas del usuario para que la contraseña anterior
// deje de servir de inmediato en cualquier dispositivo donde esté logueado.
db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$userId]);

log_trace($user, 'password_reset', "Restableció la contraseña de {$target['nombre']}");
respond(['ok' => true]);
