<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body        = json_body();
$asignaturaId = $body['asignaturaId'] ?? null;
if (!$asignaturaId) fail('La asignatura es requerida.');

$stmt = db()->prepare('SELECT nombre FROM asignaturas WHERE id = ?');
$stmt->execute([$asignaturaId]);
$asignatura = $stmt->fetch();
if (!$asignatura) fail('Asignatura no encontrada.', 404);

db()->prepare('INSERT INTO plantillas_educacion_virtual (asignatura_id, fecha, estado) VALUES (?,?,?)')
    ->execute([$asignaturaId, $body['fecha'] ?? null, $body['estado'] ?? 'Creada']);

respond(['ok' => true, 'plantilla' => ['id' => (int) db()->lastInsertId(), 'asignatura' => $asignatura['nombre']]]);
