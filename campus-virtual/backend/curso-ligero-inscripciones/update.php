<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

db()->prepare(
    'UPDATE curso_ligero_inscripciones SET progreso = ?, tiempo_total_minutos = ?, promedio_final = ?,
        ultimo_acceso = ?, estado_acceso = ? WHERE id = ?'
)->execute([
    $body['progreso'] ?? 0, $body['tiempoTotalMinutos'] ?? 0, $body['promedioFinal'] ?? null,
    $body['ultimoAcceso'] ?? null, $body['estadoAcceso'] ?? 'Activo',
    $id,
]);

respond(['ok' => true]);
