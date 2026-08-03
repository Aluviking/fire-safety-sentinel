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

// Borra primero los archivos físicos de esta carpeta y de sus subcarpetas
// (si tiene), para no dejar huérfanos en disco cuando la fila se elimine en
// cascada junto con sus documentos y subcarpetas.
$docs = db()->prepare(
    'SELECT stored_filename FROM documents
     WHERE folder_id = ? OR folder_id IN (SELECT id FROM custom_folders WHERE parent_folder_id = ?)'
);
$docs->execute([$id, $id]);
$uploadsDir = rtrim((string) config('uploads_dir'), '/');
foreach ($docs->fetchAll() as $doc) {
    $path = $uploadsDir . '/' . $doc['stored_filename'];
    if (file_exists($path)) unlink($path);
}

db()->prepare('DELETE FROM custom_folders WHERE id = ?')->execute([$id]);

$detail = $folder['parent_folder_id']
    ? "Eliminó la subcarpeta \"{$folder['folder_name']}\" de {$folder['empresa_nombre']}"
    : "Eliminó la carpeta \"{$folder['folder_name']}\" de {$folder['empresa_nombre']}";
log_trace($user, 'folder_delete', $folder['empresa_id'], $detail);

respond(['ok' => true]);
