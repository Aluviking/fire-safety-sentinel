<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body    = json_body();
$id      = $body['id'] ?? '';
$newName = trim($body['folder_name'] ?? '');
if ($id === '' || $newName === '') fail('Datos inválidos.');

$stmt = db()->prepare(
    'SELECT cf.*, c.nombre AS empresa_nombre FROM custom_folders cf
     JOIN companies c ON c.id = cf.empresa_id WHERE cf.id = ?'
);
$stmt->execute([$id]);
$folder = $stmt->fetch();
if (!$folder) fail('Carpeta no encontrada.', 404);

if ($newName !== $folder['folder_name']) {
    $dup = db()->prepare(
        'SELECT id FROM custom_folders WHERE empresa_id = ? AND phva_phase = ? AND folder_name = ? AND id != ?'
    );
    $dup->execute([$folder['empresa_id'], $folder['phva_phase'], $newName, $id]);
    if ($dup->fetch()) fail('Ya existe una carpeta con ese nombre en esta fase.');

    db()->beginTransaction();
    db()->prepare('UPDATE custom_folders SET folder_name = ? WHERE id = ?')->execute([$newName, $id]);
    // Mueve los documentos ya subidos a la carpeta con su nuevo nombre, para
    // que no queden huérfanos/invisibles tras el cambio.
    db()->prepare(
        'UPDATE documents SET folder_name = ? WHERE empresa_id = ? AND phva_phase = ? AND folder_name = ?'
    )->execute([$newName, $folder['empresa_id'], $folder['phva_phase'], $folder['folder_name']]);
    db()->commit();

    log_trace(
        $user, 'folder_rename', $folder['empresa_id'],
        "Renombró \"{$folder['folder_name']}\" a \"$newName\" en {$folder['empresa_nombre']}"
    );
}

respond(['ok' => true, 'folder' => ['id' => (int) $id, 'folder_name' => $newName]]);
