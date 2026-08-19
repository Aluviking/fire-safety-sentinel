<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.asignaturas');

$asignaturaId = $_GET['asignaturaId'] ?? '';
if ($asignaturaId === '') fail('asignaturaId requerido.');

$stmt = db()->prepare('SELECT * FROM asignatura_anuncios WHERE asignatura_id = ? ORDER BY created_at DESC');
$stmt->execute([$asignaturaId]);
respond(['ok' => true, 'anuncios' => $stmt->fetchAll()]);
