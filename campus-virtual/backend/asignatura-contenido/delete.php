<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT archivo_path FROM asignatura_contenido WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();

if ($item && !empty($item['archivo_path'])) {
    $path = rtrim((string) config('uploads_dir'), '/') . '/' . $item['archivo_path'];
    if (file_exists($path)) unlink($path);
}

// Las preguntas y sus opciones se borran en cascada (FK ON DELETE CASCADE).
db()->prepare('DELETE FROM asignatura_contenido WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
