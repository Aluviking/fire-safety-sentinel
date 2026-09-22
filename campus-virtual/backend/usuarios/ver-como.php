<?php
require __DIR__ . '/../bootstrap.php';

// "Ver como" — le da al Super Admin una sesión real de otro usuario para
// previsualizar exactamente lo que esa cuenta ve (útil cuando una misma
// persona, ej. Fernando, tiene varias cuentas: super_admin, docente,
// administrativo...), sin tener que saber su clave ni cerrar su propia
// sesión. Queda registrado en auditoría, y la sesión nueva dura poco.

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$userId = trim($body['userId'] ?? '');
if ($userId === '') fail('userId requerido.');

$stmt = db()->prepare('SELECT id, nombre, email, username, role, avatar_path, perfil_id, identificacion FROM users WHERE id = ?');
$stmt->execute([$userId]);
$target = $stmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 60 * 60 * 2); // sesión de "ver como" corta: 2 horas
db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)')
    ->execute([$token, $target['id'], $expires]);

log_trace($user, 'ver_como', "Entró a ver como {$target['nombre']} ({$target['role']})");

respond(['ok' => true, 'token' => $token, 'user' => $target]);
