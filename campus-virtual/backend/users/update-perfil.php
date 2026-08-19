<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body     = json_body();
$userId   = $body['userId'] ?? '';
$perfilId = $body['perfilId'] ?? null;
if ($userId === '') fail('Datos inválidos.');

if ($perfilId !== null) {
    $stmt = db()->prepare('SELECT id FROM perfiles WHERE id = ?');
    $stmt->execute([$perfilId]);
    if (!$stmt->fetch()) fail('Perfil no encontrado.', 404);
}

db()->prepare('UPDATE users SET perfil_id = ? WHERE id = ?')->execute([$perfilId ?: null, $userId]);
respond(['ok' => true]);
