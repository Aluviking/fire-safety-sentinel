<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body      = json_body();
$userId    = $body['userId'] ?? '';
$empresaId = $body['empresaId'] ?? null;
if ($userId === '') fail('userId requerido.');

db()->prepare('UPDATE users SET empresa_id = ? WHERE id = ?')->execute([$empresaId ?: null, $userId]);
respond(['ok' => true]);
