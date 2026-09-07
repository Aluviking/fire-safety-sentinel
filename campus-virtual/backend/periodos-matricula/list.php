<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.estudiantes');

$rows = db()->query('SELECT id, nombre FROM periodos_matricula ORDER BY nombre DESC')->fetchAll();
respond(['ok' => true, 'periodos' => $rows]);
