<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
$estudianteId = (int) ($body['estudianteId'] ?? 0);
if ($asignaturaId === 0 || $estudianteId === 0) fail('La asignatura y el estudiante son requeridos.');

$stmt = db()->prepare('SELECT id FROM asignaturas WHERE id = ?');
$stmt->execute([$asignaturaId]);
if (!$stmt->fetch()) fail('Asignatura no encontrada.', 404);

$stmt = db()->prepare('SELECT id FROM asignatura_estudiantes WHERE asignatura_id = ? AND estudiante_id = ?');
$stmt->execute([$asignaturaId, $estudianteId]);
if ($stmt->fetch()) fail('Ese estudiante ya está matriculado en esta asignatura.');

db()->prepare('INSERT INTO asignatura_estudiantes (asignatura_id, estudiante_id) VALUES (?,?)')
    ->execute([$asignaturaId, $estudianteId]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
