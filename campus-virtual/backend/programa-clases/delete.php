<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT programa_id, zoom_meeting_id FROM programa_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$row = $actual->fetch();
if (!$row) fail('Clase no encontrada.', 404);
require_gestion_programa($user, (int) $row['programa_id']);

zoom_borrar_reunion($row['zoom_meeting_id']);
db()->prepare('DELETE FROM programa_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
