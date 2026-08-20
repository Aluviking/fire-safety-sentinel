<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso_alguno($user, ['academico.cursos', 'academico.cursos_virtuales']);

$cursoId = (int) ($_GET['cursoId'] ?? 0);
if ($cursoId === 0) fail('cursoId requerido.');

$stmt = db()->prepare(
    'SELECT ce.id, ce.estudiante_id, ce.estado, ce.created_at, e.identificacion, e.nombre_completo
     FROM curso_estudiantes ce
     JOIN estudiantes e ON e.id = ce.estudiante_id
     WHERE ce.curso_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$cursoId]);
respond(['ok' => true, 'matriculados' => $stmt->fetchAll()]);
