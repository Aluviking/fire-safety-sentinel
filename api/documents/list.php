<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$folderId = $_GET['folder_id'] ?? '';
if ($folderId === '') fail('folder_id requerido.');

$folderStmt = db()->prepare('SELECT empresa_id FROM custom_folders WHERE id = ?');
$folderStmt->execute([$folderId]);
$folder = $folderStmt->fetch();
if (!$folder) fail('Carpeta no encontrada.', 404);

if ($user['role'] === 'cliente' && $user['empresa_id'] !== $folder['empresa_id']) fail('No autorizado.', 403);

$stmt = db()->prepare(
    'SELECT d.id, d.original_filename, d.size_bytes, d.mime_type, d.uploaded_at, u.nombre AS uploaded_by_name
     FROM documents d JOIN users u ON u.id = d.uploaded_by
     WHERE d.folder_id = ?
     ORDER BY d.uploaded_at DESC'
);
$stmt->execute([$folderId]);
respond(['ok' => true, 'documents' => $stmt->fetchAll()]);
