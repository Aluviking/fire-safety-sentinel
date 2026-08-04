<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['admin', 'super_admin']);

$rows = db()->query('SELECT * FROM creditos ORDER BY fecha_credito DESC, id DESC')->fetchAll();
respond(['ok' => true, 'creditos' => $rows]);
