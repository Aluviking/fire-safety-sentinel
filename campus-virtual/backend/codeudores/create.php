<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$identificacion = trim($body['identificacion'] ?? '');
$nombreCompleto = trim($body['nombreCompleto'] ?? '');

if ($identificacion === '' || $nombreCompleto === '') fail('Identificación y nombre completo son requeridos.');

$stmt = db()->prepare('SELECT id FROM codeudores WHERE identificacion = ?');
$stmt->execute([$identificacion]);
if ($stmt->fetch()) fail('Ya existe un codeudor con esa identificación.');

db()->prepare(
    'INSERT INTO codeudores (identificacion, nombre_completo, celular, correo) VALUES (?,?,?,?)'
)->execute([$identificacion, $nombreCompleto, $body['celular'] ?? null, $body['correo'] ?? null]);

respond(['ok' => true, 'codeudor' => ['id' => (int) db()->lastInsertId(), 'identificacion' => $identificacion, 'nombreCompleto' => $nombreCompleto]]);
