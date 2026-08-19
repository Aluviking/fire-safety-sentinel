<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$body = json_body();
$id   = (int) ($body['id'] ?? 0);
if ($id === 0) fail('id requerido.');

$stmt = db()->prepare('SELECT nombre FROM perfiles WHERE id = ?');
$stmt->execute([$id]);
$target = $stmt->fetch();
if (!$target) fail('Perfil no encontrado.', 404);

// Los usuarios que tenían este perfil quedan sin perfil (ON DELETE SET NULL)
// — vuelven a ver todo, el mismo comportamiento de una cuenta sin perfil
// asignado. No se bloquea el borrado por esto.
db()->prepare('DELETE FROM perfiles WHERE id = ?')->execute([$id]);

log_trace($user, 'perfil_delete', "Eliminó el perfil {$target['nombre']}");
respond(['ok' => true]);
