<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$rows = db()->query('SELECT * FROM tesoreria_terceros ORDER BY nombre')->fetchAll();
respond(['ok' => true, 'terceros' => $rows]);
