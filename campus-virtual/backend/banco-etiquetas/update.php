<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$current = db()->prepare('SELECT * FROM banco_etiquetas WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Etiqueta no encontrada.', 404);

$nombre = array_key_exists('nombre', $body) ? trim($body['nombre']) : $row['nombre'];
if ($nombre === '') fail('El nombre de la etiqueta es requerido.');

$dup = db()->prepare('SELECT id FROM banco_etiquetas WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otra etiqueta con ese nombre.');

$color = array_key_exists('color', $body) ? $body['color'] : $row['color'];

db()->prepare('UPDATE banco_etiquetas SET nombre = ?, color = ? WHERE id = ?')->execute([$nombre, $color, $id]);

log_trace($user, 'banco_etiqueta_update', "Editó la etiqueta $nombre");
respond(['ok' => true]);
