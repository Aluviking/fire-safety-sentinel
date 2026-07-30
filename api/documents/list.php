<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$empresaId = $_GET['empresa_id'] ?? '';
$phase     = $_GET['phase'] ?? '';
$folder    = $_GET['folder'] ?? '';
if ($empresaId === '' || $phase === '' || $folder === '') fail('Parámetros requeridos.');

if ($user['role'] === 'cliente' && $user['empresa_id'] !== $empresaId) fail('No autorizado.', 403);

$stmt = db()->prepare(
    'SELECT d.id, d.original_filename, d.size_bytes, d.mime_type, d.uploaded_at, u.nombre AS uploaded_by_name
     FROM documents d JOIN users u ON u.id = d.uploaded_by
     WHERE d.empresa_id = ? AND d.phva_phase = ? AND d.folder_name = ?
     ORDER BY d.uploaded_at DESC'
);
$stmt->execute([$empresaId, $phase, $folder]);
respond(['ok' => true, 'documents' => $stmt->fetchAll()]);
