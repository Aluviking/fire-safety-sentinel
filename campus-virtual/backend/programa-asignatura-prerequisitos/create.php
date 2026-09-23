<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
// Docente tiene edicion completa en Cursos/Programas/Diplomados, igual
// que Super Admin (no solo lo que tiene asignado) -- pedido explicito del
// cliente, aplica a TODOS los docentes por rol, no por cuenta puntual.
require_role($user, ['admin', 'super_admin', 'docente']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);

$body                     = json_body();
$programaId               = (int) ($body['programaId'] ?? 0);
$asignaturaId             = (int) ($body['asignaturaId'] ?? 0);
$prerequisitoAsignaturaId = (int) ($body['prerequisitoAsignaturaId'] ?? 0);
if ($programaId === 0 || $asignaturaId === 0 || $prerequisitoAsignaturaId === 0) fail('Datos incompletos.');
if ($asignaturaId === $prerequisitoAsignaturaId) fail('Una asignatura no puede ser prerrequisito de sí misma.');

db()->prepare(
    'INSERT IGNORE INTO programa_asignatura_prerequisitos (programa_id, asignatura_id, prerequisito_asignatura_id) VALUES (?,?,?)'
)->execute([$programaId, $asignaturaId, $prerequisitoAsignaturaId]);

respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
