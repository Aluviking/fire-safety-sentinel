<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT programa_id FROM programa_anuncios WHERE id = ?');
$actual->execute([$id]);
$programaId = $actual->fetchColumn();
if ($programaId === false) fail('Anuncio no encontrado.', 404);
require_gestion_programa($user, (int) $programaId);

db()->prepare('DELETE FROM programa_anuncios WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
