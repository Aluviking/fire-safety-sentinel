<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

// Las opciones se borran en cascada (FK ON DELETE CASCADE).
db()->prepare('DELETE FROM plantilla_preguntas WHERE id = ?')->execute([$id]);
respond(['ok' => true]);
