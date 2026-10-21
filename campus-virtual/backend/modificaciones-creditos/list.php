<?php
require __DIR__ . '/../bootstrap.php';

$user = require_auth();
require_role($user, ['super_admin']);

$rows = db()->query('SELECT * FROM modificaciones_creditos ORDER BY id DESC')->fetchAll();
respond(['ok' => true, 'modificaciones' => $rows]);
