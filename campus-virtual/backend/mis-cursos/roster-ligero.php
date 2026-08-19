<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'docente') fail('No autorizado.', 403);

$cursoLigeroId = (int) ($_GET['cursoLigeroId'] ?? 0);
if ($cursoLigeroId === 0) fail('cursoLigeroId requerido.');

$stmt = db()->prepare('SELECT docente_identificacion FROM cursos_ligeros WHERE id = ?');
$stmt->execute([$cursoLigeroId]);
$curso = $stmt->fetch();
if (!$curso || $curso['docente_identificacion'] !== $user['identificacion']) fail('No autorizado.', 403);

$stmt = db()->prepare(
    'SELECT i.id, i.progreso, i.estado_acceso, i.estudiante_identificacion, e.nombre_completo
     FROM curso_ligero_inscripciones i
     LEFT JOIN estudiantes e ON e.identificacion = i.estudiante_identificacion
     WHERE i.curso_ligero_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'estudiantes' => $stmt->fetchAll()]);
