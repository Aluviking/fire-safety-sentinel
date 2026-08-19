<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.administrativos');

$rows = db()->query('SELECT * FROM administrativos ORDER BY nombre_completo')->fetchAll();
respond(['ok' => true, 'administrativos' => $rows]);
