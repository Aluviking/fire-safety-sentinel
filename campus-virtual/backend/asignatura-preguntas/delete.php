<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare(
    'SELECT ac.asignatura_id FROM asignatura_preguntas ap
     JOIN asignatura_contenido ac ON ac.id = ap.contenido_id
     WHERE ap.id = ?'
);
$actual->execute([$id]);
$asignaturaId = $actual->fetchColumn();
if ($asignaturaId === false) fail('Pregunta no encontrada.', 404);
require_gestion_asignatura($user, (int) $asignaturaId);

// Las opciones se borran en cascada (FK ON DELETE CASCADE).
db()->prepare('DELETE FROM asignatura_preguntas WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
