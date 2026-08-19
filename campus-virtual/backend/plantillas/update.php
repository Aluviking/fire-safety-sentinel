<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$id           = (int) ($body['id'] ?? 0);
$asignaturaId = $body['asignaturaId'] ?? null;
if ($id === 0 || !$asignaturaId) fail('La asignatura es requerida.');

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$asignaturaId]);
$asignatura = $stmt->fetch();
if (!$asignatura) fail('Asignatura no encontrada.', 404);

db()->prepare('UPDATE plantillas_educacion_virtual SET asignatura_id = ?, fecha = ?, estado = ? WHERE id = ?')
    ->execute([$asignaturaId, $body['fecha'] ?? null, $body['estado'] ?? 'Creada', $id]);

log_trace($user, 'plantilla_update', "Editó la plantilla de {$asignatura['nombre']}");
respond(['ok' => true]);
