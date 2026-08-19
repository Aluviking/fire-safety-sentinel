<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'academico.programas');

$rows = db()->query('SELECT * FROM programas ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'programas' => $rows]);
