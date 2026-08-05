<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body       = json_body();
$userId     = $body['userId'] ?? '';
$empresaId  = $body['empresaId'] ?? '';
$canView    = !empty($body['canView']);
$canUpload  = !empty($body['canUpload']);
$canEdit    = !empty($body['canEdit']);
$canDownload = !empty($body['canDownload']);

if ($userId === '' || $empresaId === '') fail('Datos inválidos.');

db()->prepare(
    'INSERT INTO permissions (user_id, empresa_id, can_view, can_upload, can_edit, can_download, granted_by)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE can_view=VALUES(can_view), can_upload=VALUES(can_upload),
       can_edit=VALUES(can_edit), can_download=VALUES(can_download),
       granted_by=VALUES(granted_by), granted_at=NOW()'
)->execute([$userId, $empresaId, (int)$canView, (int)$canUpload, (int)$canEdit, (int)$canDownload, $user['id']]);

log_trace($user, 'perm_change', $empresaId, "Permisos actualizados para $userId");
respond(['ok' => true]);
