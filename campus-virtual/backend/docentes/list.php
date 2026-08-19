<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'institucional.docentes');

$rows = db()->query('SELECT * FROM docentes ORDER BY nombre_completo')->fetchAll();
respond(['ok' => true, 'docentes' => $rows]);
