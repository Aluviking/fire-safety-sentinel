<?php
require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$identifier     = trim($body['identifier'] ?? '');
$password       = $body['password'] ?? '';
$recaptchaToken = $body['recaptchaToken'] ?? null;

if ($identifier === '' || $password === '') fail('Correo/usuario y contraseña son requeridos.');
// reCAPTCHA desactivado temporalmente a pedido explícito del cliente (para
// poder probar el sitio directo sin el widget) — reactivar quitando este
// comentario y restaurando la línea de abajo cuando se pida.
// if (!verify_recaptcha($recaptchaToken)) fail('Verificación de seguridad fallida. Intenta de nuevo.', 400);

$stmt = db()->prepare('SELECT * FROM users WHERE email = ? OR username = ?');
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    fail('Credenciales incorrectas.', 401);
}

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 7); // 7 días
db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)')
    ->execute([$token, $user['id'], $expires]);

$permisos = user_permisos($user);
unset($user['password_hash']);
respond(['ok' => true, 'token' => $token, 'user' => $user, 'permisos' => $permisos]);
