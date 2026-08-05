<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM notas_finales ORDER BY id DESC')->fetchAll();
respond(['ok' => true, 'notasFinales' => $rows]);
