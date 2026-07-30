<?php
require __DIR__ . '/../bootstrap.php';

require_auth();
$rows = db()->query('SELECT * FROM permissions')->fetchAll();
respond(['ok' => true, 'permissions' => $rows]);
