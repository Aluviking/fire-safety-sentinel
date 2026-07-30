<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

$stmt = db()->prepare('SELECT image_path FROM ads WHERE id = 1');
$stmt->execute();
$row = $stmt->fetch();
if (!$row || empty($row['image_path'])) fail('No hay anuncio activo.', 404);

$path = rtrim((string) config('uploads_dir'), '/') . '/' . $row['image_path'];
if (!file_exists($path)) fail('Imagen no encontrada en el servidor.', 404);

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = match ($ext) {
    'png'  => 'image/png',
    'webp' => 'image/webp',
    default => 'image/jpeg',
};

header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($path));
header('Cache-Control: private, max-age=300');
readfile($path);
exit;
