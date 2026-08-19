<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$id     = (int) ($body['id'] ?? 0);
$nombre = trim($body['nombre'] ?? '');
if ($id === 0 || $nombre === '') fail('El nombre del perfil es requerido.');

$dup = db()->prepare('SELECT id FROM perfiles WHERE nombre = ? AND id != ?');
$dup->execute([$nombre, $id]);
if ($dup->fetch()) fail('Ya existe otro perfil con ese nombre.');

db()->prepare('UPDATE perfiles SET nombre = ?, descripcion = ?, estado = ? WHERE id = ?')
    ->execute([$nombre, $body['descripcion'] ?? null, $body['estado'] ?? 'Activo', $id]);

// Resincroniza los permisos: borra los actuales y vuelve a insertar los que
// llegaron marcados (mismo patrón que programa_asignaturas).
db()->prepare('DELETE FROM perfil_permisos WHERE perfil_id = ?')->execute([$id]);
$modulosValidos = array_keys(modulos_flat());
$permisos = $body['permisos'] ?? [];
if (is_array($permisos)) {
    $stmt = db()->prepare('INSERT INTO perfil_permisos (perfil_id, modulo, puede_ver, puede_editar) VALUES (?,?,?,?)');
    foreach ($permisos as $modulo => $p) {
        if (!in_array($modulo, $modulosValidos, true)) continue;
        $ver = !empty($p['ver']);
        $editar = !empty($p['editar']);
        if (!$ver && !$editar) continue;
        $stmt->execute([$id, $modulo, $ver ? 1 : 0, $editar ? 1 : 0]);
    }
}

log_trace($user, 'perfil_update', "Editó el perfil $nombre");
respond(['ok' => true]);
