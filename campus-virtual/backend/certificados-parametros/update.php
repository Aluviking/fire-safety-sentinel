<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();

db()->exec('INSERT IGNORE INTO certificados_parametros (id) VALUES (1)');
db()->prepare(
    'UPDATE certificados_parametros SET nombre_firma = ?, cargo_firma = ?, texto_legal = ?, formato_numeracion = ? WHERE id = 1'
)->execute([
    $body['nombreFirma'] ?? null, $body['cargoFirma'] ?? null,
    $body['textoLegal'] ?? null, $body['formatoNumeracion'] ?? null,
]);

log_trace($user, 'parametros_certificados_update', 'Editó los parámetros de constancias y certificados');
respond(['ok' => true]);
