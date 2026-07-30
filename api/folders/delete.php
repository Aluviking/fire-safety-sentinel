<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = $body['id'] ?? '';
if ($id === '') fail('id requerido.');

$stmt = db()->prepare('SELECT cf.*, c.nombre AS empresa_nombre FROM custom_folders cf JOIN companies c ON c.id = cf.empresa_id WHERE cf.id = ?');
$stmt->execute([$id]);
$folder = $stmt->fetch();
if (!$folder) fail('Carpeta no encontrada.', 404);

db()->prepare('DELETE FROM custom_folders WHERE id = ?')->execute([$id]);

log_trace($user, 'folder_delete', $folder['empresa_id'], "Eliminó la carpeta \"{$folder['folder_name']}\" de {$folder['empresa_nombre']}");

respond(['ok' => true]);
