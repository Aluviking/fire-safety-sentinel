<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$empresaId = $_GET['empresa_id'] ?? '';
if ($empresaId === '') fail('empresa_id requerido.');

if ($user['role'] === 'cliente' && $user['empresa_id'] !== $empresaId) fail('No autorizado.', 403);

$stmt = db()->prepare(
    'SELECT id, phva_phase, folder_name FROM custom_folders WHERE empresa_id = ? ORDER BY created_at'
);
$stmt->execute([$empresaId]);
respond(['ok' => true, 'folders' => $stmt->fetchAll()]);
