<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.banco_preguntas');

$id = (int) ($_GET['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT * FROM banco_preguntas WHERE id = ?');
$stmt->execute([$id]);
$pregunta = $stmt->fetch();
if (!$pregunta) fail('Pregunta no encontrada.', 404);

$stmt = db()->prepare('SELECT id, texto, correcta, orden FROM banco_pregunta_opciones WHERE pregunta_id = ? ORDER BY orden, id');
$stmt->execute([$id]);
$pregunta['opciones'] = $stmt->fetchAll();

$stmt = db()->prepare('SELECT id, termino, respuesta, orden FROM banco_pregunta_pares WHERE pregunta_id = ? ORDER BY orden, id');
$stmt->execute([$id]);
$pregunta['pares'] = $stmt->fetchAll();

$stmt = db()->prepare(
    'SELECT e.id, e.nombre, e.color FROM banco_pregunta_etiquetas pe
     JOIN banco_etiquetas e ON e.id = pe.etiqueta_id
     WHERE pe.pregunta_id = ?'
);
$stmt->execute([$id]);
$pregunta['etiquetas'] = $stmt->fetchAll();

respond(['ok' => true, 'pregunta' => $pregunta]);
