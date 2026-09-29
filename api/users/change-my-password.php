<?php
require __DIR__ . '/../bootstrap.php';

// Autoservicio: cualquier usuario autenticado (incluido un Admin, como pidió
// el cliente para Fernando) puede cambiar SU PROPIA contraseña sin depender
// de otro Super Admin. A diferencia de reset-password.php (que un Admin/Super
// Admin usa para asignarle una clave nueva a OTRO usuario sin pedir la
// anterior), aquí sí se exige la contraseña actual, porque es autoservicio:
// evita que una sesión robada bloquee al dueño real de la cuenta.

$user = require_auth();

$body            = json_body();
$currentPassword = $body['currentPassword'] ?? '';
$newPassword     = $body['newPassword'] ?? '';

if ($currentPassword === '') fail('Ingresa tu contraseña actual.');
if (strlen($newPassword) < 6) fail('La contraseña nueva debe tener al menos 6 caracteres.');

$stmt = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$user['id']]);
$row = $stmt->fetch();
if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
    fail('La contraseña actual no es correcta.', 401);
}

$hash = password_hash($newPassword, PASSWORD_DEFAULT);
db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);

// Cierra la sesión en cualquier OTRO dispositivo/navegador donde esté
// logueado (misma clave vieja ya no sirve ahí) — pero conserva la sesión
// actual para que no quede desconectado justo después de cambiar su clave.
$currentToken = bearer_token();
db()->prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?')->execute([$user['id'], $currentToken]);

log_trace($user, 'password_self_change', null, 'Cambió su propia contraseña.');
respond(['ok' => true]);
