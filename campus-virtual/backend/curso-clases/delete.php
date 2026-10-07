<?php
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../zoom-lib.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin', 'docente']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$actual = db()->prepare('SELECT zoom_meeting_id FROM curso_clases_virtuales WHERE id = ?');
$actual->execute([$id]);
$meetingId = $actual->fetchColumn();

zoom_borrar_reunion($meetingId ?: null);
db()->prepare('DELETE FROM curso_clases_virtuales WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
