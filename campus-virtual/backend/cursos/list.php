<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.cursos');

$rows = db()->query('SELECT * FROM cursos ORDER BY fecha_inicio DESC, id DESC')->fetchAll();
respond(['ok' => true, 'cursos' => $rows]);
