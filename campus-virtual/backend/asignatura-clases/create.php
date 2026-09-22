<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$titulo       = trim($body['titulo'] ?? '');
$fechaInicio  = $body['fechaInicio'] ?? '';
if ($asignaturaId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');
require_gestion_asignatura($user, $asignaturaId);

db()->prepare('INSERT INTO asignatura_clases_virtuales (asignatura_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin) VALUES (?,?,?,?,?)')
    ->execute([$asignaturaId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $body['fechaFin'] ?? null]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId()]]);
