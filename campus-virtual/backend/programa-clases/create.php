<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$programaId  = (int) ($body['programaId'] ?? 0);
$titulo      = trim($body['titulo'] ?? '');
$fechaInicio = $body['fechaInicio'] ?? '';
if ($programaId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');

db()->prepare('INSERT INTO programa_clases_virtuales (programa_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin) VALUES (?,?,?,?,?)')
    ->execute([$programaId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $body['fechaFin'] ?? null]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId()]]);
