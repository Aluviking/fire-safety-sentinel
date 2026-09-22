<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT asignatura_id FROM asignatura_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$asignaturaId = $actual->fetchColumn();
if ($asignaturaId === false) fail('Clase no encontrada.', 404);
require_gestion_asignatura($user, (int) $asignaturaId);

db()->prepare('DELETE FROM asignatura_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
