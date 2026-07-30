<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$targetId = $_POST['user_id'] ?? $user['id'];

// Solo un Admin/Super Admin puede subir la foto de otro usuario; cualquiera
// puede subir la suya propia.
if ($targetId !== $user['id']) {
    require_role($user, ['admin', 'super_admin']);
}

$stmt = db()->prepare('SELECT id, nombre, avatar_path FROM users WHERE id = ?');
$stmt->execute([$targetId]);
$target = $stmt->fetch();
if (!$target) fail('Usuario no encontrado.', 404);

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Imagen inválida.');

$maxBytes = 2 * 1024 * 1024; // 2 MB
if ($_FILES['file']['size'] > $maxBytes) fail('La imagen supera el límite de 2MB.');

$allowedExt   = ['jpg', 'jpeg', 'png', 'webp'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen JPG, PNG o WEBP.');

$storedName = 'avatar-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar la imagen.', 500);

// Borra la foto anterior para no dejar archivos huérfanos en disco.
if (!empty($target['avatar_path'])) {
    $oldPath = $uploadsDir . '/' . $target['avatar_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare('UPDATE users SET avatar_path = ? WHERE id = ?')->execute([$storedName, $targetId]);

log_trace($user, 'avatar_update', null, "Actualizó la foto de perfil de {$target['nombre']}");
respond(['ok' => true, 'avatarPath' => $storedName]);
