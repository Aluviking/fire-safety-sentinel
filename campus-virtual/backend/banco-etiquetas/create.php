<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre de la etiqueta es requerido.');

$dup = db()->prepare('SELECT id FROM banco_etiquetas WHERE nombre = ?');
$dup->execute([$nombre]);
if ($dup->fetch()) fail('Ya existe una etiqueta con ese nombre.');

$color = $body['color'] ?? '#94A3B8';
db()->prepare('INSERT INTO banco_etiquetas (nombre, color) VALUES (?, ?)')->execute([$nombre, $color]);
$id = (int) db()->lastInsertId();

log_trace($user, 'banco_etiqueta_create', "Creó la etiqueta $nombre");
respond(['ok' => true, 'etiqueta' => ['id' => $id, 'nombre' => $nombre, 'color' => $color]]);
