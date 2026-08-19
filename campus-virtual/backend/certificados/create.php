<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$nombre = trim($_POST['nombre'] ?? '');
if ($nombre === '') fail('El nombre del certificado es requerido.');
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Archivo inválido.');

$maxBytes = 10 * 1024 * 1024; // 10 MB (los .docx pesan más que una imagen)
if ($_FILES['file']['size'] > $maxBytes) fail('El archivo supera el límite de 10MB.');

$allowedExt   = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen (JPG, PNG, WEBP), PDF o Word (DOC, DOCX).');

$storedName = 'cert-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar el archivo.', 500);

db()->prepare('INSERT INTO certificados_plantillas (nombre, imagen_path) VALUES (?, ?)')
    ->execute([$nombre, $storedName]);

respond(['ok' => true, 'certificado' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre]]);
