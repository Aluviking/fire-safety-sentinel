<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT asignatura_id, creado_por_identificacion FROM asignatura_anuncios WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();
if (!$row) fail('Anuncio no encontrado.', 404);
require_gestion_asignatura($user, (int) $row['asignatura_id']);
require_dueno_o_compartido($user, $row['creado_por_identificacion']);

db()->prepare('DELETE FROM asignatura_anuncios WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
