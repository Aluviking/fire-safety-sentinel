<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$rows = db()->query(
    'SELECT p.*, (SELECT COUNT(*) FROM programa_estudiantes pe WHERE pe.programa_id = p.id) AS matriculados
     FROM programas p
     ORDER BY p.nombre'
)->fetchAll();
respond(['ok' => true, 'programas' => $rows]);
