<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT titulo, archivo_path, asignatura_id FROM asignatura_contenido WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row || empty($row['archivo_path'])) fail('Sin archivo.', 404);

require_acceso_asignatura($user, (int) $row['asignatura_id']);

$path = rtrim((string) config('uploads_dir'), '/') . '/' . $row['archivo_path'];
if (!file_exists($path)) fail('Archivo no encontrado en el servidor.', 404);

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = match ($ext) {
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
    'jpg', 'jpeg' => 'image/jpeg',
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt'  => 'application/vnd.ms-powerpoint',
    'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'xls'  => 'application/vnd.ms-excel',
    'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'mp4'  => 'video/mp4',
    'webm' => 'video/webm',
    'mov'  => 'video/quicktime',
    'mp3'  => 'audio/mpeg',
    'wav'  => 'audio/wav',
    'ogg'  => 'audio/ogg',
    default => 'application/octet-stream',
};

$inlineTypes = ['png', 'webp', 'gif', 'jpg', 'jpeg', 'pdf', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'];
if (!in_array($ext, $inlineTypes, true)) {
    header('Content-Disposition: attachment; filename="' . preg_replace('/[^\w\-. ]/', '_', $row['titulo']) . '.' . $ext . '"');
}

header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($path));
header('Accept-Ranges: bytes');
header('Cache-Control: private, max-age=300');
readfile($path);
exit;
