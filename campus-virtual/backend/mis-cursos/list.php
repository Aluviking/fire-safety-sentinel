<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
if ($user['role'] !== 'docente') fail('No autorizado.', 403);

if (empty($user['identificacion'])) {
    respond(['ok' => true, 'cursos' => [], 'cursosLigeros' => [], 'vinculado' => false]);
}

$cursos = db()->prepare(
    'SELECT c.*, (SELECT COUNT(*) FROM curso_estudiantes ce WHERE ce.curso_id = c.id) AS matriculados
     FROM cursos c
     WHERE c.docente_identificacion = ?
     ORDER BY c.fecha_inicio DESC, c.id DESC'
);
$cursos->execute([$user['identificacion']]);

$cursosLigeros = db()->prepare(
    'SELECT cl.*, (SELECT COUNT(*) FROM curso_ligero_inscripciones i WHERE i.curso_ligero_id = cl.id) AS inscritos
     FROM cursos_ligeros cl
     WHERE cl.docente_identificacion = ?
     ORDER BY cl.nombre'
);
$cursosLigeros->execute([$user['identificacion']]);

respond(['ok' => true, 'cursos' => $cursos->fetchAll(), 'cursosLigeros' => $cursosLigeros->fetchAll(), 'vinculado' => true]);
