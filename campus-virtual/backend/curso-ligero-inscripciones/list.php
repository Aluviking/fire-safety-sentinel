<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos_ligeros');

$cursoLigeroId = $_GET['cursoLigeroId'] ?? '';
if ($cursoLigeroId === '') fail('cursoLigeroId requerido.');

$stmt = db()->prepare(
    'SELECT i.*, e.nombre_completo
     FROM curso_ligero_inscripciones i
     LEFT JOIN estudiantes e ON e.identificacion = i.estudiante_identificacion
     WHERE i.curso_ligero_id = ?
     ORDER BY e.nombre_completo'
);
$stmt->execute([$cursoLigeroId]);
respond(['ok' => true, 'inscripciones' => $stmt->fetchAll()]);
