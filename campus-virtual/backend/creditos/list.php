<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'tesoreria.creditos');

$rows = db()->query('SELECT * FROM creditos ORDER BY fecha_credito DESC, id DESC')->fetchAll();
respond(['ok' => true, 'creditos' => $rows]);
