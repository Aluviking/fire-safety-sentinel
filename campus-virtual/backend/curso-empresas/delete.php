<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

db()->prepare('DELETE FROM curso_empresas WHERE id = ?')->execute([$id]);
log_trace($user, 'curso_empresa_delete', "Eliminó la empresa-cliente #$id (y sus empleados)");

respond(['ok' => true]);
