<?php
require __DIR__ . '/../bootstrap.php';

// Salta directo a otra cuenta que ya está vinculada a la tuya (sin pedir
// clave otra vez) — a diferencia de "Ver como" (exclusivo de Super Admin,
// para previsualizar CUALQUIER cuenta), esto lo puede usar cualquier
// usuario, pero SOLO hacia cuentas que un Super Admin vinculó explícitamente
// con la suya (usuarios_vinculados). No es un candado por rol, es un
// candado por vínculo explícito.

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$userId = trim($body['userId'] ?? '');
if ($userId === '') fail('userId requerido.');

$stmt = db()->prepare(
    'SELECT u.id, u.nombre, u.email, u.username, u.role, u.avatar_path, u.perfil_id, u.identificacion
     FROM usuarios_vinculados uv JOIN users u ON u.id = uv.vinculado_a_user_id
     WHERE uv.user_id = ? AND uv.vinculado_a_user_id = ?'
);
$stmt->execute([$user['id'], $userId]);
$target = $stmt->fetch();
if (!$target) fail('Esa cuenta no está vinculada a la tuya.', 403);

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 7);
db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)')
    ->execute([$token, $target['id'], $expires]);

log_trace($user, 'cambiar_cuenta', "Cambió a la cuenta vinculada {$target['nombre']} ({$target['role']})");

respond(['ok' => true, 'token' => $token, 'user' => $target]);
