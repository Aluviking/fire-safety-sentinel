<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT programa_id, creado_por_identificacion FROM programa_anuncios WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();
if (!$row) fail('Anuncio no encontrado.', 404);
require_gestion_programa($user, (int) $row['programa_id']);
require_dueno_o_compartido($user, $row['creado_por_identificacion']);

db()->prepare('DELETE FROM programa_anuncios WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
