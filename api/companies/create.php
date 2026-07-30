<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
$nit    = trim($body['nit'] ?? '');
$sector = trim($body['sector'] ?? '');
if ($nombre === '' || $nit === '' || $sector === '') fail('Datos inválidos.');

$id = new_id('emp');
db()->prepare('INSERT INTO companies (id, nombre, nit, sector) VALUES (?,?,?,?)')
    ->execute([$id, $nombre, $nit, $sector]);

log_trace($user, 'company_create', $id, "Creó la empresa $nombre");

respond(['ok' => true, 'company' => ['id' => $id, 'nombre' => $nombre, 'nit' => $nit, 'sector' => $sector]]);
