<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$id           = (int) ($body['id'] ?? 0);
$nombre       = trim($body['nombre'] ?? '');
$asignaturaId = $body['asignaturaId'] ?? null;
if ($id === 0 || ($nombre === '' && !$asignaturaId)) fail('Escribe un nombre o selecciona una asignatura.');

$asignaturaNombre = null;
if ($asignaturaId) {
    $stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
    $stmt->execute([$asignaturaId]);
    $asignatura = $stmt->fetch();
    if (!$asignatura) fail('Asignatura no encontrada.', 404);
    $asignaturaNombre = $asignatura['nombre'];
}

db()->prepare(
    'UPDATE plantillas_educacion_virtual SET nombre = ?, asignatura_id = ?, fecha = ?, estado = ?,
        publicado_por_defecto = ? WHERE id = ?'
)->execute([
    $nombre ?: null, $asignaturaId ?: null, $body['fecha'] ?? null, $body['estado'] ?? 'Creada',
    !empty($body['publicadoPorDefecto']) ? 1 : 0, $id,
]);

log_trace($user, 'plantilla_update', "Editó la plantilla " . ($nombre ?: $asignaturaNombre));
respond(['ok' => true]);
