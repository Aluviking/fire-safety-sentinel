<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre_completo FROM docentes WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Docente no encontrado.', 404);

db()->prepare('DELETE FROM docentes WHERE id = ?')->execute([$id]);

log_trace($user, 'docente_delete', "Eliminó a {$target['nombre_completo']}");
respond(['ok' => true]);
