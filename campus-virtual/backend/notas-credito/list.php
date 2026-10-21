<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$rows = db()->query('SELECT * FROM notas_credito ORDER BY fecha DESC, id DESC')->fetchAll();
respond(['ok' => true, 'notasCredito' => $rows]);
