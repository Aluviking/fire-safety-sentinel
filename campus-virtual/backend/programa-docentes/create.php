<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body       = json_body();
$programaId = (int) ($body['programaId'] ?? 0);
$docenteId  = (int) ($body['docenteId'] ?? 0);
if ($programaId === 0 || $docenteId === 0) fail('El curso y el docente son requeridos.');

$dup = db()->prepare('SELECT id FROM programa_docentes WHERE programa_id = ? AND docente_id = ?');
$dup->execute([$programaId, $docenteId]);
if ($dup->fetch()) fail('Ese docente ya está asignado a este curso.');

db()->prepare('INSERT INTO programa_docentes (programa_id, docente_id) VALUES (?, ?)')
    ->execute([$programaId, $docenteId]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
