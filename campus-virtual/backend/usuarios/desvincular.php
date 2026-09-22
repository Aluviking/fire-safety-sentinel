<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body    = json_body();
$userIdA = trim($body['userIdA'] ?? '');
$userIdB = trim($body['userIdB'] ?? '');
if ($userIdA === '' || $userIdB === '') fail('userIdA y userIdB son requeridos.');

db()->prepare('DELETE FROM usuarios_vinculados WHERE (user_id = ? AND vinculado_a_user_id = ?) OR (user_id = ? AND vinculado_a_user_id = ?)')
    ->execute([$userIdA, $userIdB, $userIdB, $userIdA]);

log_trace($user, 'usuarios_desvincular', "Desvinculó dos cuentas");

respond(['ok' => true]);
