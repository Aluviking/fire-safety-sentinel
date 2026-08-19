<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$titulo       = trim($body['titulo'] ?? '');
if ($asignaturaId === 0 || $titulo === '') fail('El título es requerido.');

db()->prepare('INSERT INTO asignatura_anuncios (asignatura_id, titulo, mensaje, importancia) VALUES (?,?,?,?)')
    ->execute([$asignaturaId, $titulo, $body['mensaje'] ?? null, $body['importancia'] ?? 'Normal']);

respond(['ok' => true, 'anuncio' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
