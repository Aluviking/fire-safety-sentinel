<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT archivo_path, asignatura_id, creado_por_identificacion FROM asignatura_contenido WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) fail('Recurso no encontrado.', 404);
require_gestion_asignatura($user, (int) $item['asignatura_id']);
require_dueno_o_compartido($user, $item['creado_por_identificacion']);

if (!empty($item['archivo_path'])) {
    $path = rtrim((string) config('uploads_dir'), '/') . '/' . $item['archivo_path'];
    if (file_exists($path)) unlink($path);
}

// Las preguntas y sus opciones se borran en cascada (FK ON DELETE CASCADE).
db()->prepare('DELETE FROM asignatura_contenido WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
