<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Programas/Diplomados, igual
// que Super Admin (no solo lo que tiene asignado) -- pedido explicito del
// cliente, aplica a TODOS los docentes por rol, no por cuenta puntual.
require_role($user, ['super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$id = $_POST['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM programas WHERE id = ?');
$stmt->execute([$id]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Imagen inválida.');

$maxBytes = 3 * 1024 * 1024; // 3 MB
if ($_FILES['file']['size'] > $maxBytes) fail('La imagen supera el límite de 3MB.');

$allowedExt   = ['jpg', 'jpeg', 'png', 'webp'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Usa una imagen JPG, PNG o WEBP.');

$storedName = 'programa-' . bin2hex(random_bytes(16)) . '.' . $ext;
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar la imagen.', 500);

if (!empty($programa['imagen_path'])) {
    $oldPath = $uploadsDir . '/' . $programa['imagen_path'];
    if (file_exists($oldPath)) unlink($oldPath);
}

db()->prepare('UPDATE programas SET imagen_path = ? WHERE id = ?')->execute([$storedName, $id]);

log_trace($user, 'programa_update', "Actualizó la imagen de {$programa['nombre']}");
respond(['ok' => true, 'imagenPath' => $storedName]);
