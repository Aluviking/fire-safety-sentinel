<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

db()->prepare('DELETE FROM matriculas WHERE id = ?')->execute([$id]);
log_trace($user, 'programa_update', "Eliminó una matrícula (id $id)");
respond(['ok' => true]);
