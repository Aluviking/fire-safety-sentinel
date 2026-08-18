<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body           = json_body();
$id             = (int) ($body['id'] ?? 0);
$identificacion = trim($body['identificacion'] ?? '');
$nombreCompleto = trim($body['nombreCompleto'] ?? '');

if ($id === 0 || $identificacion === '' || $nombreCompleto === '') {
    fail('Identificación y nombre completo son requeridos.');
}

$dup = db()->prepare('SELECT id FROM codeudores WHERE identificacion = ? AND id != ?');
$dup->execute([$identificacion, $id]);
if ($dup->fetch()) fail('Ya existe otro codeudor con esa identificación.');

db()->prepare(
    'UPDATE codeudores SET identificacion = ?, nombre_completo = ?, celular = ?, correo = ? WHERE id = ?'
)->execute([$identificacion, $nombreCompleto, $body['celular'] ?? null, $body['correo'] ?? null, $id]);

log_trace($user, 'codeudor_update', "Editó a $nombreCompleto");
respond(['ok' => true]);
