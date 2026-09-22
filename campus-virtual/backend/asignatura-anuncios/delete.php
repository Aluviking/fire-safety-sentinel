<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT asignatura_id FROM asignatura_anuncios WHERE id = ?');
$actual->execute([$id]);
$asignaturaId = $actual->fetchColumn();
if ($asignaturaId === false) fail('Anuncio no encontrado.', 404);
require_gestion_asignatura($user, (int) $asignaturaId);

db()->prepare('DELETE FROM asignatura_anuncios WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
