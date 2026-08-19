<?php
require __DIR__ . '/../bootstrap.php';

require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT nombre, imagen_path FROM certificados_plantillas WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row || empty($row['imagen_path'])) fail('Sin archivo.', 404);

$path = rtrim((string) config('uploads_dir'), '/') . '/' . $row['imagen_path'];
if (!file_exists($path)) fail('Archivo no encontrado en el servidor.', 404);

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = match ($ext) {
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'jpg', 'jpeg' => 'image/jpeg',
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    default => 'application/octet-stream',
};

// Word no se puede mostrar dentro del navegador — se fuerza la descarga.
// Imagen y PDF sí se muestran inline (miniatura / vista previa).
$isDownloadOnly = in_array($ext, ['doc', 'docx'], true);
if ($isDownloadOnly) {
    header('Content-Disposition: attachment; filename="' . preg_replace('/[^\w\-. ]/', '_', $row['nombre']) . '.' . $ext . '"');
}

header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($path));
header('Cache-Control: private, max-age=300');
readfile($path);
exit;
