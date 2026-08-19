<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos');

$rows = db()->query(
    'SELECT c.*, (SELECT COUNT(*) FROM curso_estudiantes ce WHERE ce.curso_id = c.id) AS matriculados
     FROM cursos c
     ORDER BY c.fecha_inicio DESC, c.id DESC'
)->fetchAll();
respond(['ok' => true, 'cursos' => $rows]);
