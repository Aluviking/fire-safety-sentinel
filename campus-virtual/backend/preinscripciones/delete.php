<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

// Solo borra el registro de la inscripción — si ya se matriculó, el
// estudiante real que se creó a partir de ella NO se toca acá.
db()->prepare('DELETE FROM preinscripciones WHERE id = ?')->execute([$id]);
log_trace($user, 'preinscripcion_delete', "Eliminó la inscripción #$id");

respond(['ok' => true]);
