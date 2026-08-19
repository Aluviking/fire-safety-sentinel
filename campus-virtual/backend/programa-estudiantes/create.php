<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$programaId   = (int) ($body['programaId'] ?? 0);
$estudianteId = (int) ($body['estudianteId'] ?? 0);
if ($programaId === 0 || $estudianteId === 0) fail('El programa y el estudiante son requeridos.');

$stmt = db()->prepare('SELECT id FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
if (!$stmt->fetch()) fail('Programa no encontrado.', 404);

$stmt = db()->prepare('SELECT id FROM programa_estudiantes WHERE programa_id = ? AND estudiante_id = ?');
$stmt->execute([$programaId, $estudianteId]);
if ($stmt->fetch()) fail('Ese estudiante ya está matriculado en este programa.');

db()->prepare('INSERT INTO programa_estudiantes (programa_id, estudiante_id) VALUES (?,?)')
    ->execute([$programaId, $estudianteId]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
