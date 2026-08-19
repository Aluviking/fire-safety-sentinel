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

$current = db()->prepare('SELECT * FROM plantillas_educacion_virtual WHERE id = ?');
$current->execute([$id]);
$row = $current->fetch();
if (!$row) fail('Plantilla no encontrada.', 404);

$asignaturaNombre = null;
if ($asignaturaId) {
    $stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
    $stmt->execute([$asignaturaId]);
    $asignatura = $stmt->fetch();
    if (!$asignatura) fail('Asignatura no encontrada.', 404);
    $asignaturaNombre = $asignatura['nombre'];
}

// El modal rápido de la lista y la pestaña de detalle (Ajustes) mandan
// sub-conjuntos distintos de campos — solo el campo que realmente vino en
// el body se actualiza, el resto conserva su valor actual, mismo patrón ya
// aplicado en programas/asignaturas/cursos/cursos_ligeros.
$field = fn(string $key, string $col) => array_key_exists($key, $body) ? $body[$key] : $row[$col];

db()->prepare(
    'UPDATE plantillas_educacion_virtual SET nombre = ?, asignatura_id = ?, fecha = ?, estado = ?,
        publicado_por_defecto = ? WHERE id = ?'
)->execute([
    $nombre ?: null, $asignaturaId ?: null, $field('fecha', 'fecha'), $field('estado', 'estado'),
    array_key_exists('publicadoPorDefecto', $body) ? (!empty($body['publicadoPorDefecto']) ? 1 : 0) : $row['publicado_por_defecto'],
    $id,
]);

log_trace($user, 'plantilla_update', "Editó la plantilla " . ($nombre ?: $asignaturaNombre));
respond(['ok' => true]);
