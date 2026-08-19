<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM cursos_ligeros ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'cursosLigeros' => $rows]);
