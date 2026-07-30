<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT avatar_path FROM users WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row || empty($row['avatar_path'])) fail('Sin foto de perfil.', 404);

$path = rtrim((string) config('uploads_dir'), '/') . '/' . $row['avatar_path'];
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
