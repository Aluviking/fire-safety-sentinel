<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = $body['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc) fail('No encontrado.', 404);

// Eliminar es exclusivo de Admin y Super Admin — ni siquiera Equipo con
// permiso de "Editar" puede borrar archivos, sin excepción.
if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') {
    fail('Solo un Admin o Super Admin puede eliminar archivos.', 403);
}

$path = rtrim(config('uploads_dir'), '/') . '/' . $doc['stored_filename'];
if (file_exists($path)) unlink($path);
db()->prepare('DELETE FROM documents WHERE id = ?')->execute([$id]);

log_trace($user, 'delete_file', $doc['empresa_id'], "Eliminó {$doc['original_filename']}");
respond(['ok' => true]);
