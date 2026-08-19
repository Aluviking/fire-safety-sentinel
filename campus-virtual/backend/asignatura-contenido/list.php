<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

require_acceso_asignatura($user, (int) $asignaturaId);

$stmt = db()->prepare('SELECT * FROM asignatura_contenido WHERE asignatura_id = ? ORDER BY orden, id');
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'contenido' => $stmt->fetchAll()]);
