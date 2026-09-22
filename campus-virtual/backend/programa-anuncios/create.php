<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body       = json_body();
$programaId = (int) ($body['programaId'] ?? 0);
$titulo     = trim($body['titulo'] ?? '');
if ($programaId === 0 || $titulo === '') fail('El título es requerido.');
require_gestion_programa($user, $programaId);

db()->prepare('INSERT INTO programa_anuncios (programa_id, titulo, mensaje, importancia) VALUES (?,?,?,?)')
    ->execute([$programaId, $titulo, $body['mensaje'] ?? null, $body['importancia'] ?? 'Normal']);

respond(['ok' => true, 'anuncio' => ['id' => (int) db()->lastInsertId(), 'titulo' => $titulo]]);
