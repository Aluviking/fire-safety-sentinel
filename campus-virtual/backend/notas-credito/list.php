<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_permiso($user, 'tesoreria.notas_credito');

$rows = db()->query('SELECT * FROM notas_credito ORDER BY fecha DESC, id DESC')->fetchAll();
respond(['ok' => true, 'notasCredito' => $rows]);
