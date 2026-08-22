<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas', 'editar');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT titulo FROM banco_preguntas WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) fail('Pregunta no encontrada.', 404);

// ON DELETE CASCADE limpia opciones, pares y etiquetas vinculadas.
db()->prepare('DELETE FROM banco_preguntas WHERE id = ?')->execute([$id]);

log_trace($user, 'banco_pregunta_delete', "Eliminó la pregunta \"{$row['titulo']}\"");
respond(['ok' => true]);
