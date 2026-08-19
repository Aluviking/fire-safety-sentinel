<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body   = json_body();
$nombre = trim($body['nombre'] ?? '');
if ($nombre === '') fail('El nombre del perfil es requerido.');

$stmt = db()->prepare('SELECT id FROM perfiles WHERE nombre = ?');
$stmt->execute([$nombre]);
if ($stmt->fetch()) fail('Ya existe un perfil con ese nombre.');

db()->prepare('INSERT INTO perfiles (nombre, descripcion, estado) VALUES (?,?,?)')
    ->execute([$nombre, $body['descripcion'] ?? null, $body['estado'] ?? 'Activo']);
$perfilId = (int) db()->lastInsertId();

// Solo se guardan las filas donde al menos un permiso quedó marcado — un
// módulo sin ver/editar simplemente no tiene fila (se asume falso).
$modulosValidos = array_keys(modulos_flat());
$permisos = $body['permisos'] ?? [];
if (is_array($permisos)) {
    $stmt = db()->prepare('INSERT INTO perfil_permisos (perfil_id, modulo, puede_ver, puede_editar) VALUES (?,?,?,?)');
    foreach ($permisos as $modulo => $p) {
        if (!in_array($modulo, $modulosValidos, true)) continue;
        $ver = !empty($p['ver']);
        $editar = !empty($p['editar']);
        if (!$ver && !$editar) continue;
        $stmt->execute([$perfilId, $modulo, $ver ? 1 : 0, $editar ? 1 : 0]);
    }
}

log_trace($user, 'perfil_create', "Creó el perfil $nombre");
respond(['ok' => true, 'perfil' => ['id' => $perfilId, 'nombre' => $nombre]]);
