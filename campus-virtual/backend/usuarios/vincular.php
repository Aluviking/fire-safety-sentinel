<?php
require __DIR__ . '/../bootstrap.php';

// Conecta dos cuentas como "la misma persona" — a propósito, solo Super
// Admin puede hacerlo. Después de esto, cualquiera de las dos puede saltar
// a la otra desde su propio panel (usuarios/cambiar-cuenta.php).

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body     = json_body();
$userIdA  = trim($body['userIdA'] ?? '');
$userIdB  = trim($body['userIdB'] ?? '');
if ($userIdA === '' || $userIdB === '') fail('Selecciona las dos cuentas.');
if ($userIdA === $userIdB) fail('Selecciona dos cuentas distintas.');

$stmt = db()->prepare('SELECT id, nombre FROM users WHERE id IN (?, ?)');
$stmt->execute([$userIdA, $userIdB]);
$rows = $stmt->fetchAll();
if (count($rows) !== 2) fail('Una de las dos cuentas no existe.', 404);

$insert = db()->prepare('INSERT IGNORE INTO usuarios_vinculados (user_id, vinculado_a_user_id) VALUES (?, ?)');
$insert->execute([$userIdA, $userIdB]);
$insert->execute([$userIdB, $userIdA]);

log_trace($user, 'usuarios_vincular', "Vinculó las cuentas {$rows[0]['nombre']} y {$rows[1]['nombre']}");

respond(['ok' => true]);
