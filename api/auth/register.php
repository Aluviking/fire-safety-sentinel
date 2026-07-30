<?php
require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body     = json_body();
$nombre   = trim($body['nombre'] ?? '');
$email    = trim($body['email'] ?? '');
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

if ($nombre === '' || !str_contains($email, '@') || strlen($username) < 4 || strlen($password) < 6) {
    fail('Datos inválidos.');
}

$stmt = db()->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) fail('El correo o usuario ya existe.');

$id   = new_id('user');
$hash = password_hash($password, PASSWORD_DEFAULT);
db()->prepare('INSERT INTO users (id, nombre, email, username, password_hash, role) VALUES (?,?,?,?,?,\'cliente\')')
    ->execute([$id, $nombre, $email, $username, $hash]);

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 7);
db()->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)')
    ->execute([$token, $id, $expires]);

respond(['ok' => true, 'token' => $token, 'user' => [
    'id' => $id, 'nombre' => $nombre, 'email' => $email, 'username' => $username,
    'role' => 'cliente', 'empresa_id' => null,
]]);
