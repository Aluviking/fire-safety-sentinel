<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = $body['id'] ?? '';
$nombre = trim($body['nombre'] ?? '');
$nit    = trim($body['nit'] ?? '');
if ($id === '' || $nombre === '' || $nit === '') fail('Datos inválidos.');

$stmt = db()->prepare('SELECT * FROM companies WHERE id = ?');
$stmt->execute([$id]);
$company = $stmt->fetch();
if (!$company) fail('Empresa no encontrada.', 404);

db()->prepare('UPDATE companies SET nombre = ?, nit = ? WHERE id = ?')->execute([$nombre, $nit, $id]);

log_trace($user, 'company_update', $id, "Editó datos de {$company['nombre']}" . ($nombre !== $company['nombre'] ? " → $nombre" : ''));

respond(['ok' => true, 'company' => ['id' => $id, 'nombre' => $nombre, 'nit' => $nit, 'sector' => $company['sector']]]);
