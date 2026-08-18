<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre_completo FROM estudiantes WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Estudiante no encontrado.', 404);

// Sus matrículas se borran en cascada (FK ON DELETE CASCADE en schema.sql).
db()->prepare('DELETE FROM estudiantes WHERE id = ?')->execute([$id]);

log_trace($user, 'estudiante_delete', "Eliminó a {$target['nombre_completo']}");
respond(['ok' => true]);
