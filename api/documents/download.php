<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();
if (!$doc) fail('No encontrado.', 404);

if ($user['role'] === 'cliente' && $user['empresa_id'] !== $doc['empresa_id']) fail('No autorizado.', 403);

$path = rtrim(config('uploads_dir'), '/') . '/' . $doc['stored_filename'];
if (!file_exists($path)) fail('Archivo no encontrado en el servidor.', 404);

log_trace($user, 'view_folder', $doc['empresa_id'], "Descargó {$doc['original_filename']}");

header('Content-Type: ' . $doc['mime_type']);
header('Content-Disposition: attachment; filename="' . addslashes($doc['original_filename']) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
