<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$empresaId = $_POST['id'] ?? '';
if ($empresaId === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM companies WHERE id = ?');
$stmt->execute([$empresaId]);
$company = $stmt->fetch();
if (!$company) fail('Empresa no encontrada.', 404);

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Imagen inválida.');

$maxBytes = 3 * 1024 * 1024; // 3 MB
if ($_FILES['file']['size'] > $maxBytes) fail('La imagen supera el límite de 3MB.');

$allowedExt   = ['jpg', 'jpeg', 'png', 'webp'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen JPG, PNG o WEBP.');

$storedName = 'company-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar la imagen.', 500);

// Borra la foto anterior para no dejar archivos huérfanos en disco.
if (!empty($company['photo_path'])) {
    $oldPath = $uploadsDir . '/' . $company['photo_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare('UPDATE companies SET photo_path = ? WHERE id = ?')->execute([$storedName, $empresaId]);

log_trace($user, 'company_photo_update', $empresaId, "Actualizó la foto de {$company['nombre']}");
respond(['ok' => true, 'photoPath' => $storedName]);
