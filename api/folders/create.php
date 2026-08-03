<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$empresaId      = $body['empresa_id'] ?? '';
$phase          = strtoupper(trim($body['phase'] ?? ''));
$name           = trim($body['folder_name'] ?? '');
$parentFolderId = $body['parent_folder_id'] ?? null;

if ($empresaId === '' || $name === '') fail('Datos inválidos.');
if (!in_array($phase, ['P', 'H', 'V', 'A'], true)) fail('Fase PHVA inválida.');

/* ── Crear carpetas/subcarpetas: Admin/Super Admin siempre, Equipo solo si
      tiene el permiso "Editar" otorgado para esta empresa. ── */
$canManage = false;
if ($user['role'] === 'admin' || $user['role'] === 'super_admin') {
    $canManage = true;
} elseif ($user['role'] === 'equipo') {
    $stmt = db()->prepare('SELECT can_edit FROM permissions WHERE equipo_user_id = ? AND empresa_id = ?');
    $stmt->execute([$user['id'], $empresaId]);
    $perm = $stmt->fetch();
    $canManage = (bool)($perm['can_edit'] ?? false);
}
if (!$canManage) fail('No tienes permiso para crear carpetas aquí.', 403);

$stmt = db()->prepare('SELECT nombre FROM companies WHERE id = ?');
$stmt->execute([$empresaId]);
$company = $stmt->fetch();
if (!$company) fail('Empresa no encontrada.', 404);

/* ── Si es subcarpeta, valida que el padre exista, sea de la misma empresa
      y fase, y que no sea a su vez una subcarpeta (solo 1 nivel permitido). ── */
if ($parentFolderId !== null && $parentFolderId !== '') {
    $parentFolderId = (int) $parentFolderId;
    $stmt = db()->prepare('SELECT * FROM custom_folders WHERE id = ?');
    $stmt->execute([$parentFolderId]);
    $parent = $stmt->fetch();
    if (!$parent) fail('Carpeta padre no encontrada.', 404);
    if ($parent['empresa_id'] !== $empresaId || $parent['phva_phase'] !== $phase) {
        fail('La carpeta padre no pertenece a esta empresa/fase.', 400);
    }
    if ($parent['parent_folder_id'] !== null) {
        fail('No se pueden crear subcarpetas dentro de una subcarpeta.', 400);
    }
} else {
    $parentFolderId = null;
}

/* ── Evita nombres duplicados dentro del mismo padre (comparación segura con
      NULL, ya que el índice único de la tabla no lo cubre para subcarpetas). ── */
$dup = db()->prepare(
    'SELECT id FROM custom_folders
     WHERE empresa_id = ? AND phva_phase = ? AND folder_name = ? AND parent_folder_id <=> ?'
);
$dup->execute([$empresaId, $phase, $name, $parentFolderId]);
if ($dup->fetch()) fail('Ya existe una carpeta con ese nombre ahí.');

db()->prepare(
    'INSERT INTO custom_folders (empresa_id, phva_phase, folder_name, parent_folder_id, created_by) VALUES (?,?,?,?,?)'
)->execute([$empresaId, $phase, $name, $parentFolderId, $user['id']]);

$id = (int) db()->lastInsertId();

$action = $parentFolderId ? 'folder_create' : 'folder_create';
$detail = $parentFolderId
    ? "Creó la subcarpeta \"$name\" (fase $phase) en {$company['nombre']}"
    : "Creó la carpeta \"$name\" (fase $phase) en {$company['nombre']}";
log_trace($user, $action, $empresaId, $detail);

respond(['ok' => true, 'folder' => [
    'id' => $id, 'phva_phase' => $phase, 'folder_name' => $name, 'parent_folder_id' => $parentFolderId,
]]);
