<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body      = json_body();
$empresaId = $body['empresa_id'] ?? '';
$phase     = strtoupper(trim($body['phase'] ?? ''));
$name      = trim($body['folder_name'] ?? '');

if ($empresaId === '' || $name === '') fail('Datos inválidos.');
if (!in_array($phase, ['P', 'H', 'V', 'A'], true)) fail('Fase PHVA inválida.');

$stmt = db()->prepare('SELECT nombre FROM companies WHERE id = ?');
$stmt->execute([$empresaId]);
$company = $stmt->fetch();
if (!$company) fail('Empresa no encontrada.', 404);

$dup = db()->prepare('SELECT id FROM custom_folders WHERE empresa_id = ? AND phva_phase = ? AND folder_name = ?');
$dup->execute([$empresaId, $phase, $name]);
if ($dup->fetch()) fail('Ya existe una carpeta con ese nombre en esta fase.');

db()->prepare(
    'INSERT INTO custom_folders (empresa_id, phva_phase, folder_name, created_by) VALUES (?,?,?,?)'
)->execute([$empresaId, $phase, $name, $user['id']]);

$id = (int) db()->lastInsertId();

log_trace($user, 'folder_create', $empresaId, "Creó la carpeta \"$name\" (fase $phase) en {$company['nombre']}");

respond(['ok' => true, 'folder' => ['id' => $id, 'phva_phase' => $phase, 'folder_name' => $name]]);
