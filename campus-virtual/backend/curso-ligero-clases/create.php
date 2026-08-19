<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body          = json_body();
$cursoLigeroId = (int) ($body['cursoLigeroId'] ?? 0);
$titulo        = trim($body['titulo'] ?? '');
$fechaInicio   = $body['fechaInicio'] ?? '';
if ($cursoLigeroId === 0 || $titulo === '' || $fechaInicio === '') fail('Título y fecha de inicio son requeridos.');

db()->prepare('INSERT INTO curso_ligero_clases_virtuales (curso_ligero_id, aula_recurso_id, titulo, fecha_inicio, fecha_fin) VALUES (?,?,?,?,?)')
    ->execute([$cursoLigeroId, $body['aulaRecursoId'] ?? null, $titulo, $fechaInicio, $body['fechaFin'] ?? null]);

respond(['ok' => true, 'clase' => ['id' => (int) db()->lastInsertId()]]);
