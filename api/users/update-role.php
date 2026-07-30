<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body   = json_body();
$userId = $body['userId'] ?? '';
$role   = $body['role'] ?? '';
if (!in_array($role, ['super_admin', 'admin', 'equipo', 'cliente'], true) || $userId === '') fail('Datos inválidos.');

// Solo un Super Admin puede otorgar (o quitar) el rol de Admin o Super Admin.
// Un Admin normal solo puede mover usuarios entre Equipo y Cliente.
if (in_array($role, ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede asignar el rol de Admin o Super Admin.', 403);
}
$targetStmt = db()->prepare('SELECT role FROM users WHERE id = ?');
$targetStmt->execute([$userId]);
$target = $targetStmt->fetch();
if ($target && in_array($target['role'], ['admin', 'super_admin'], true) && $user['role'] !== 'super_admin') {
    fail('Solo un Super Admin puede cambiar el rol de un Admin o Super Admin.', 403);
}

db()->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $userId]);
log_trace($user, 'role_change', null, "Cambió rol de $userId a $role");
respond(['ok' => true]);
