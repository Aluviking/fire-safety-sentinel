<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$programaId   = (int) ($body['programaId'] ?? 0);
$estudianteId = (int) ($body['estudianteId'] ?? 0);
$jornada      = trim($body['jornada'] ?? '');
if ($programaId === 0 || $estudianteId === 0 || $jornada === '') fail('Estudiante, programa y jornada son requeridos.');

$stmt = db()->prepare('SELECT nombre FROM programas WHERE id = ?');
$stmt->execute([$programaId]);
$programa = $stmt->fetch();
if (!$programa) fail('Programa no encontrado.', 404);

$stmt = db()->prepare('SELECT id FROM estudiantes WHERE id = ?');
$stmt->execute([$estudianteId]);
if (!$stmt->fetch()) fail('Estudiante no encontrado.', 404);

db()->prepare(
    'INSERT INTO matriculas (estudiante_id, estado, sede, programa, nivel, periodo)
     VALUES (?,?,?,?,?,?)'
)->execute([
    $estudianteId, $body['estado'] ?? 'ACTIVO', 'Principal',
    $programa['nombre'] . ' - ' . $jornada, $body['nivel'] ?? null, $body['periodo'] ?? null,
]);

log_trace($user, 'programa_update', "Matriculó un estudiante en {$programa['nombre']}");
respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
