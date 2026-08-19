<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body          = json_body();
$cursoLigeroId = (int) ($body['cursoLigeroId'] ?? 0);
$titulo        = trim($body['titulo'] ?? '');
if ($cursoLigeroId === 0 || $titulo === '') fail('El título es requerido.');

db()->prepare('INSERT INTO curso_ligero_anuncios (curso_ligero_id, titulo, mensaje, importancia) VALUES (?,?,?,?)')
    ->execute([$cursoLigeroId, $titulo, $body['mensaje'] ?? null, $body['importancia'] ?? 'Normal']);

respond(['ok' => true, 'anuncio' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
