<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

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

/* ── Renombrar: Admin/Super Admin siempre, Equipo solo con permiso "Editar"
      otorgado para esta empresa. ── */
$canManage = false;
if ($user['role'] === 'admin' || $user['role'] === 'super_admin') {
    $canManage = true;
} elseif ($user['role'] === 'equipo') {
    $permStmt = db()->prepare('SELECT can_edit FROM permissions WHERE equipo_user_id = ? AND empresa_id = ?');
    $permStmt->execute([$user['id'], $folder['empresa_id']]);
    $perm = $permStmt->fetch();
    $canManage = (bool)($perm['can_edit'] ?? false);
}
if (!$canManage) fail('No tienes permiso para editar esta carpeta.', 403);

if ($newName !== $folder['folder_name']) {
    $dup = db()->prepare(
        'SELECT id FROM custom_folders
         WHERE empresa_id = ? AND phva_phase = ? AND folder_name = ? AND parent_folder_id <=> ? AND id != ?'
    );
    $dup->execute([$folder['empresa_id'], $folder['phva_phase'], $newName, $folder['parent_folder_id'], $id]);
    if ($dup->fetch()) fail('Ya existe una carpeta con ese nombre ahí.');

    db()->beginTransaction();
    db()->prepare('UPDATE custom_folders SET folder_name = ? WHERE id = ?')->execute([$newName, $id]);
    // Mantiene el nombre denormalizado en documents en sincronía (referencia
    // histórica/legible); la relación real ya vive en documents.folder_id.
    db()->prepare('UPDATE documents SET folder_name = ? WHERE folder_id = ?')->execute([$newName, $id]);
    db()->commit();

    log_trace(
        $user, 'folder_rename', $folder['empresa_id'],
        "Renombró \"{$folder['folder_name']}\" a \"$newName\" en {$folder['empresa_nombre']}"
    );
}

respond(['ok' => true, 'folder' => ['id' => (int) $id, 'folder_name' => $newName]]);
