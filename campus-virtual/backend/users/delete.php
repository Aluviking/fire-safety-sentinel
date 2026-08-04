<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body   = json_body();
$userId = $body['userId'] ?? '';
if ($userId === '') fail('userId requerido.');

if ($userId === $user['id']) fail('No puedes eliminar tu propia cuenta.', 400);

$stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$target = $stmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

// Solo un Super Admin puede eliminar a otro Admin o Super Admin.
if (in_array($target['role'], ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede eliminar una cuenta de Admin o Super Admin.', 403);
}

db()->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
respond(['ok' => true]);
