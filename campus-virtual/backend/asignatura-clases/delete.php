<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT asignatura_id, zoom_meeting_id FROM asignatura_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();
if (!$row) fail('Clase no encontrada.', 404);
require_gestion_asignatura($user, (int) $row['asignatura_id']);

zoom_borrar_reunion($row['zoom_meeting_id']);
db()->prepare('DELETE FROM asignatura_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
