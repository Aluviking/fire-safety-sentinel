<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body             = json_body();
$equipoUserId     = $body['equipoUserId'] ?? '';
$empresaId        = $body['empresaId'] ?? '';
$canEdit          = !empty($body['canEdit']);
$canUpload        = !empty($body['canUpload']);
$clienteCanUpload = !empty($body['clienteCanUpload']);

if ($equipoUserId === '' || $empresaId === '') fail('Datos inválidos.');

db()->prepare(
    'INSERT INTO permissions (equipo_user_id, empresa_id, can_edit, can_upload, cliente_can_upload, granted_by)
     VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE can_edit=VALUES(can_edit), can_upload=VALUES(can_upload),
       cliente_can_upload=VALUES(cliente_can_upload), granted_by=VALUES(granted_by), granted_at=NOW()'
)->execute([$equipoUserId, $empresaId, (int)$canEdit, (int)$canUpload, (int)$clienteCanUpload, $user['id']]);

log_trace($user, 'perm_change', $empresaId, "Permisos actualizados para $equipoUserId");
respond(['ok' => true]);
