<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre, imagen_path FROM certificados_plantillas WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Certificado no encontrado.', 404);

if (!empty($target['imagen_path'])) {
    $path = rtrim((string) config('uploads_dir'), '/') . '/' . $target['imagen_path'];
    if (file_exists($path)) unlink($path);
}

db()->prepare('DELETE FROM certificados_plantillas WHERE id = ?')->execute([$id]);

log_trace($user, 'certificado_delete', "Eliminó el certificado {$target['nombre']}");
respond(['ok' => true]);
