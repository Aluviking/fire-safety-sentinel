<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM codeudores ORDER BY nombre_completo')->fetchAll();
respond(['ok' => true, 'codeudores' => $rows]);
