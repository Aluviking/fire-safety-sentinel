<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$id = $_POST['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM plantillas_educacion_virtual WHERE id = ?');
$stmt->execute([$id]);
$plantilla = $stmt->fetch();
if (!$plantilla) fail('Plantilla no encontrada.', 404);

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Imagen inválida.');

$maxBytes = 3 * 1024 * 1024; // 3 MB
if ($_FILES['file']['size'] > $maxBytes) fail('La imagen supera el límite de 3MB.');

// Mismo set de formatos que muestra Q10 en Ajustes: JPG, JPEG, PNG, GIF, BMP.
$allowedExt   = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen JPG, JPEG, PNG, GIF o BMP.');

$storedName = 'plantilla-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar la imagen.', 500);

if (!empty($plantilla['imagen_path'])) {
    $oldPath = $uploadsDir . '/' . $plantilla['imagen_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare('UPDATE plantillas_educacion_virtual SET imagen_path = ? WHERE id = ?')->execute([$storedName, $id]);

log_trace($user, 'plantilla_update', "Actualizó la imagen de la plantilla #$id");
respond(['ok' => true, 'imagenPath' => $storedName]);
