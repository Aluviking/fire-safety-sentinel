<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

db()->prepare(
    'UPDATE programa_asignaturas SET nivel = ?, creditos = ?, ih_semanal = ?, ih_total = ?, evaluar_para_cerrar = ?
     WHERE id = ?'
)->execute([
    $body['nivel'] ?? null, $body['creditos'] ?? null, $body['ihSemanal'] ?? null, $body['ihTotal'] ?? null,
    !empty($body['evaluarParaCerrar']) ? 1 : 0,
    $id,
]);

respond(['ok' => true]);
