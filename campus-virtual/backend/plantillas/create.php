<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$nombre       = trim($body['nombre'] ?? '');
$asignaturaId = $body['asignaturaId'] ?? null;
if ($nombre === '' && !$asignaturaId) fail('Escribe un nombre o selecciona una asignatura.');

$asignaturaNombre = null;
if ($asignaturaId) {
    $stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
    $stmt->execute([$asignaturaId]);
    $asignatura = $stmt->fetch();
    if (!$asignatura) fail('Asignatura no encontrada.', 404);
    $asignaturaNombre = $asignatura['nombre'];
}

db()->prepare('INSERT INTO plantillas_educacion_virtual (nombre, asignatura_id, fecha, estado) VALUES (?,?,?,?)')
    ->execute([$nombre ?: null, $asignaturaId ?: null, $body['fecha'] ?? null, $body['estado'] ?? 'Creada']);

respond(['ok' => true, 'plantilla' => ['id' => (int) db()->lastInsertId(), 'nombre' => $nombre ?: $asignaturaNombre]]);
