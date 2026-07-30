<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$empresaId = $_POST['empresa_id'] ?? '';
$phase     = $_POST['phase'] ?? '';
$folder    = $_POST['folder'] ?? '';
if ($empresaId === '' || $phase === '' || $folder === '') fail('Parámetros requeridos.');
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Archivo inválido.');

/* ── Resolver permiso de subida según rol ── */
$canUpload = false;
if ($user['role'] === 'admin' || $user['role'] === 'super_admin') {
    $canUpload = true;
} elseif ($user['role'] === 'equipo') {
    $stmt = db()->prepare('SELECT can_upload FROM permissions WHERE equipo_user_id = ? AND empresa_id = ?');
    $stmt->execute([$user['id'], $empresaId]);
    $perm = $stmt->fetch();
    $canUpload = (bool)($perm['can_upload'] ?? false);
} elseif ($user['role'] === 'cliente' && $user['empresa_id'] === $empresaId) {
    $stmt = db()->prepare('SELECT 1 FROM permissions WHERE empresa_id = ? AND cliente_can_upload = 1 LIMIT 1');
    $stmt->execute([$empresaId]);
    $canUpload = (bool)$stmt->fetch();
}
if (!$canUpload) fail('No tienes permiso para subir archivos aquí.', 403);

/* ── Validaciones de archivo ── */
$maxBytes = 15 * 1024 * 1024; // 15 MB
if ($_FILES['file']['size'] > $maxBytes) fail('El archivo supera el límite de 15MB.');

$allowedExt   = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip'];
$originalName = basename($_FILES['file']['name']);
$ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt, true)) fail('Tipo de archivo no permitido. Usa PDF, Word, Excel, PowerPoint, imagen o ZIP.');

$storedName  = bin2hex(random_bytes(20)) . '.' . $ext;
$uploadsDir  = rtrim(config('uploads_dir'), '/');
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0750, true);
$destination = $uploadsDir . '/' . $storedName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) fail('No se pudo guardar el archivo.', 500);

$stmt = db()->prepare(
    'INSERT INTO documents (empresa_id, phva_phase, folder_name, original_filename, stored_filename, size_bytes, mime_type, uploaded_by)
     VALUES (?,?,?,?,?,?,?,?)'
);
$stmt->execute([
    $empresaId, $phase, $folder, $originalName, $storedName,
    $_FILES['file']['size'], $_FILES['file']['type'], $user['id'],
]);

log_trace($user, 'upload_file', $empresaId, "$originalName · $folder");
respond(['ok' => true, 'id' => db()->lastInsertId()]);
