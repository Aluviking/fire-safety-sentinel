<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Imagen inválida.');

$maxBytes = 5 * 1024 * 1024; // 5 MB
if ($_FILES['file']['size'] > $maxBytes) fail('La imagen supera el límite de 5MB.');

$allowedExt   = ['jpg', 'jpeg', 'png', 'webp'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen JPG, PNG o WEBP.');

$storedName = 'ad-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar la imagen.', 500);

// Borra el anuncio anterior para no dejar archivos huérfanos en disco.
$stmt = db()->prepare('SELECT image_path FROM ads WHERE id = 1');
$stmt->execute();
$existing = $stmt->fetch();
if ($existing && !empty($existing['image_path'])) {
    $oldPath = $uploadsDir . '/' . $existing['image_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare(
    'INSERT INTO ads (id, image_path, updated_by, updated_at) VALUES (1, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE image_path = VALUES(image_path), updated_by = VALUES(updated_by), updated_at = NOW()'
)->execute([$storedName, $user['id']]);

log_trace($user, 'ad_update', null, 'Actualizó el anuncio de publicidad');
respond(['ok' => true]);
