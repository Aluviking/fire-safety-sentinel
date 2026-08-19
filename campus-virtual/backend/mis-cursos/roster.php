<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'docente') fail('No autorizado.', 403);

$cursoId = (int) ($_GET['cursoId'] ?? 0);
if ($cursoId === 0) fail('cursoId requerido.');

$stmt = db()->prepare('SELECT docente_identificacion FROM cursos WHERE id = ?');
$stmt->execute([$cursoId]);
$curso = $stmt->fetch();
if (!$curso || $curso['docente_identificacion'] !== $user['identificacion']) fail('No autorizado.', 403);

$stmt = db()->prepare(
    'SELECT ce.id, ce.estado, e.identificacion, e.nombre_completo
     FROM curso_estudiantes ce
     JOIN estudiantes e ON e.id = ce.estudiante_id
     WHERE ce.curso_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$cursoId]);
respond(['ok' => true, 'estudiantes' => $stmt->fetchAll()]);
