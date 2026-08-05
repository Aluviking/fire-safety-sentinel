<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$id     = $_GET['id'] ?? '';
$intent = $_GET['intent'] ?? 'download'; // 'view' (ojito, en el navegador) o 'download' (forzado)
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc) fail('No encontrado.', 404);

$field = $intent === 'view' ? 'can_view' : 'can_download';
if (!has_permission($user, $doc['empresa_id'], $field)) fail('No tienes permiso para esto.', 403);

$path = rtrim(config('uploads_dir'), '/') . '/' . $doc['stored_filename'];
if (!file_exists($path)) fail('Archivo no encontrado en el servidor.', 404);

log_trace($user, 'view_folder', $doc['empresa_id'], ($intent === 'view' ? 'Vio' : 'Descargó') . " {$doc['original_filename']}");

header('Content-Type: ' . $doc['mime_type']);
header('Content-Disposition: ' . ($intent === 'view' ? 'inline' : 'attachment') . '; filename="' . addslashes($doc['original_filename']) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
