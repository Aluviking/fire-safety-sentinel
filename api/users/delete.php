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

// Borra primero los archivos físicos que este usuario haya subido, para no
// dejar huérfanos en disco cuando sus filas se eliminen en cascada.
$docs = db()->prepare('SELECT stored_filename FROM documents WHERE uploaded_by = ?');
$docs->execute([$userId]);
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
foreach ($docs->fetchAll() as $doc) {
    $path = $uploadsDir . '/' . $doc['stored_filename'];
    if (file_exists($path)) unlink($path);
}

// Borra también su foto de perfil, si tenía una.
if (!empty($target['avatar_path'])) {
    $avatarPath = $uploadsDir . '/' . $target['avatar_path'];
    if (file_exists($avatarPath)) unlink($avatarPath);
}

db()->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);

log_trace($user, 'user_delete', null, "Eliminó a {$target['nombre']} ({$target['role']})");
respond(['ok' => true]);
