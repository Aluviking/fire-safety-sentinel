<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$id = $_POST['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM curso_contenido WHERE id = ?');
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) fail('Recurso no encontrado.', 404);

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Archivo inválido.');

$maxBytes = 30 * 1024 * 1024; // 30 MB (video/audio pesan más)
if ($_FILES['file']['size'] > $maxBytes) fail('El archivo supera el límite de 30MB.');

$allowedExt = [
    'jpg', 'jpeg', 'png', 'webp', 'gif',
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'mp4', 'webm', 'mov',
    'mp3', 'wav', 'ogg',
];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Tipo de archivo no permitido.');

$storedName = 'curso-recurso-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar el archivo.', 500);

if (!empty($item['archivo_path'])) {
    $oldPath = $uploadsDir . '/' . $item['archivo_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare('UPDATE curso_contenido SET archivo_path = ? WHERE id = ?')->execute([$storedName, $id]);

respond(['ok' => true, 'archivoPath' => $storedName]);
