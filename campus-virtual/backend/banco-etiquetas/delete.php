<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM banco_etiquetas WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) fail('Etiqueta no encontrada.', 404);

// ON DELETE CASCADE en banco_pregunta_etiquetas ya limpia el vínculo — las
// preguntas en sí NO se borran, solo pierden esta etiqueta.
db()->prepare('DELETE FROM banco_etiquetas WHERE id = ?')->execute([$id]);

log_trace($user, 'banco_etiqueta_delete', "Eliminó la etiqueta {$row['nombre']}");
respond(['ok' => true]);
