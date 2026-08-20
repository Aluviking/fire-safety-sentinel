<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body         = json_body();
$programaId   = (int) ($body['programaId'] ?? 0);
$asignaturaId = (int) ($body['asignaturaId'] ?? 0);
if ($programaId === 0 || $asignaturaId === 0) fail('El programa y la asignatura son requeridos.');

$dup = db()->prepare('SELECT id FROM programa_asignaturas WHERE programa_id = ? AND asignatura_id = ?');
$dup->execute([$programaId, $asignaturaId]);
if ($dup->fetch()) fail('Esa asignatura ya está asignada a este pensum.');

$stmt = db()->prepare('SELECT COALESCE(MAX(orden), 0) + 1 FROM programa_asignaturas WHERE programa_id = ?');
$stmt->execute([$programaId]);
$orden = (int) $stmt->fetchColumn();

db()->prepare(
    'INSERT INTO programa_asignaturas (programa_id, asignatura_id, orden, nivel, creditos, ih_semanal, ih_total, evaluar_para_cerrar)
     VALUES (?,?,?,?,?,?,?,?)'
)->execute([
    $programaId, $asignaturaId, $orden,
    $body['nivel'] ?? null, $body['creditos'] ?? null, $body['ihSemanal'] ?? null, $body['ihTotal'] ?? null,
    array_key_exists('evaluarParaCerrar', $body) ? (!empty($body['evaluarParaCerrar']) ? 1 : 0) : 1,
]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
